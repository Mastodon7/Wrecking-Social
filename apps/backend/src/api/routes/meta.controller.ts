import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createHash } from 'crypto';
import { IntegrationService } from '@gitroom/nestjs-libraries/database/prisma/integrations/integration.service';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';
import { MetaSignedRequestDto } from '@gitroom/nestjs-libraries/dtos/integrations/meta.signed.request.dto';

// Callbacks Meta calls when someone removes the app from their Facebook,
// Instagram or Threads settings, or asks Meta to delete their data. They are
// set in each Meta app's dashboard:
//   https://<domain>/api/meta/<facebook|instagram|threads>/deauthorize
//   https://<domain>/api/meta/<facebook|instagram|threads>/data-deletion
// Both disconnect the person's channels the same way deleting a channel in
// the app does: the scheduled posts are cancelled and the tokens destroyed.
@ApiTags('Meta')
@Controller('/meta')
export class MetaController {
  constructor(
    private _integrationService: IntegrationService,
    private _postsService: PostsService
  ) {}

  @Post('/:app/deauthorize')
  @HttpCode(200)
  async deauthorize(
    @Param('app') app: string,
    @Body() body: MetaSignedRequestDto
  ) {
    await this.disconnectMetaUser(app, body.signed_request);
    return {};
  }

  @Post('/:app/data-deletion')
  @HttpCode(200)
  async dataDeletion(
    @Param('app') app: string,
    @Body() body: MetaSignedRequestDto
  ) {
    const userId = await this.disconnectMetaUser(app, body.signed_request);
    const confirmationCode = createHash('sha256')
      .update(`${app}:${userId}:${Date.now()}`)
      .digest('hex')
      .slice(0, 16);

    return {
      url: `${process.env.FRONTEND_URL}/data-deletion?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    };
  }

  private async disconnectMetaUser(app: string, signedRequest: string) {
    const metaApp = this._integrationService.metaCallbackApp(app);
    const userId = metaApp?.secret
      ? this._integrationService.metaUserFromSignedRequest(
          metaApp.secret,
          signedRequest
        )
      : null;

    if (!metaApp || !userId) {
      throw new HttpException('Invalid signed request', HttpStatus.BAD_REQUEST);
    }

    const channels =
      await this._integrationService.getActiveChannelsOfPlatformUser(
        metaApp.providers,
        userId
      );

    for (const channel of channels) {
      const posts = await this._integrationService.getPostsForChannel(
        channel.organizationId,
        channel.id
      );
      for (const post of posts) {
        await this._postsService
          .deletePost(channel.organizationId, post.group)
          .catch(() => {});
      }
      await this._integrationService.deleteChannel(
        channel.organizationId,
        channel.id
      );
    }

    return userId;
  }
}
