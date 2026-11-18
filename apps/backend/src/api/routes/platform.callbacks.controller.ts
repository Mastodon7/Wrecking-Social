import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { createHash } from 'crypto';
import { PostsService } from '@gitroom/nestjs-libraries/database/prisma/posts/posts.service';

// Callbacks a platform calls when someone removes the app from their account
// or asks the platform to delete their data, for example Meta's deauthorize
// and data deletion callbacks. Each is set in the platform app's dashboard:
//   https://<domain>/api/platform-callbacks/<provider>/deauthorize
//   https://<domain>/api/platform-callbacks/<provider>/data-deletion
// The provider checks the request is genuine (platformUserFromCallback).
@ApiTags('Platform callbacks')
@Controller('/platform-callbacks')
export class PlatformCallbacksController {
  private readonly _logger = new Logger(PlatformCallbacksController.name);

  constructor(private _postsService: PostsService) {}

  @Post('/:provider/deauthorize')
  @HttpCode(200)
  async deauthorize(
    @Param('provider') provider: string,
    @Body() body: Record<string, unknown>
  ) {
    const result = await this._postsService.disconnectPlatformUser(
      provider,
      body
    );
    if (!result) {
      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
    }

    this._logger.log(
      `${provider} deauthorize for ${result.platformUserId}, channels removed: ${result.channelIds.join(', ') || 'none'}`
    );
    return {};
  }

  @Post('/:provider/data-deletion')
  @HttpCode(200)
  async dataDeletion(
    @Param('provider') provider: string,
    @Body() body: Record<string, unknown>
  ) {
    const result = await this._postsService.disconnectPlatformUser(
      provider,
      body
    );
    if (!result) {
      throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
    }

    const confirmationCode = createHash('sha256')
      .update(`${provider}:${result.platformUserId}:${Date.now()}`)
      .digest('hex')
      .slice(0, 16);

    // Kept in the logs so a person who emails us the code can be matched
    this._logger.log(
      `${provider} data deletion ${confirmationCode} for ${result.platformUserId}, channels removed: ${result.channelIds.join(', ') || 'none'}`
    );

    return {
      url: `${process.env.FRONTEND_URL}/data-deletion?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    };
  }
}
