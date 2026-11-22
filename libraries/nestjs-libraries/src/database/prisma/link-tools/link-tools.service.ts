import { Injectable } from '@nestjs/common';
import { LinkToolsRepository } from '@gitroom/nestjs-libraries/database/prisma/link-tools/link-tools.repository';
import {
  HashtagGroupDto,
  LinkTrackingDto,
} from '@gitroom/nestjs-libraries/dtos/link-tools/link-tools.dto';

const URL_REGEX =
  /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gm;

// a provider identifier ("instagram-standalone", "linkedin-page") as the
// utm_source a person reads in Google Analytics ("instagram", "linkedin")
export const utmSource = (provider: string) =>
  (provider || 'social').split('-')[0].toLowerCase();

export const normalizeDomains = (value: string) =>
  [
    ...new Set(
      (value || '')
        .split(/[\s,]+/)
        .map((d) =>
          d
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/^www\./, '')
            .replace(/\/.*$/, '')
        )
        .filter((d) => /^[a-z0-9.-]+\.[a-z]{2,}$/.test(d))
    ),
  ];

const slug = (value: string, fallback: string) =>
  (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || fallback;

// Adds utm_source/medium/campaign to one URL, unless it is not one of our
// domains or it already carries UTM tags
export const tagUrl = (
  url: string,
  domains: string[],
  source: string,
  medium: string,
  campaign: string
) => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
  if (!domains.some((d) => host === d || host.endsWith(`.${d}`))) {
    return url;
  }
  if (parsed.searchParams.has('utm_source')) {
    return url;
  }
  parsed.searchParams.set('utm_source', source);
  parsed.searchParams.set('utm_medium', medium);
  parsed.searchParams.set('utm_campaign', campaign);
  return parsed.toString();
};

@Injectable()
export class LinkToolsService {
  constructor(private _repository: LinkToolsRepository) {}

  async getTracking(organizationId: string) {
    const row = await this._repository.getTracking(organizationId);
    return {
      enabled: row?.enabled || false,
      domains: row?.domains || '',
      medium: row?.medium || 'social',
      campaign: row?.campaign || '',
    };
  }

  saveTracking(organizationId: string, body: LinkTrackingDto) {
    return this._repository.saveTracking(organizationId, {
      enabled: !!body.enabled,
      domains: normalizeDomains(body.domains).join(', '),
      medium: slug(body.medium, 'social'),
      campaign: slug(body.campaign, ''),
    });
  }

  // Runs on the post text before short links are made, so a short link
  // points at the tagged address. The text is decoded the same way the
  // short-link service decodes it.
  async applyUtm(organizationId: string, provider: string, messages: string[]) {
    const settings = await this._repository.getTracking(organizationId);
    const domains = normalizeDomains(settings?.domains || '');
    if (!settings?.enabled || !domains.length) {
      return messages;
    }
    const source = utmSource(provider);
    const medium = settings.medium || 'social';
    const campaign = settings.campaign || 'wrecking-social';

    return messages.map((message) => {
      if (!message || !/https?:\/\//.test(message)) {
        return message;
      }
      const text = message
        .replace(/&amp;/g, '&')
        .replace(/&quest;/g, '?')
        .replace(/&num;/g, '#');
      return text.replace(URL_REGEX, (url) =>
        tagUrl(url, domains, source, medium, campaign)
      );
    });
  }

  listHashtagGroups(organizationId: string) {
    return this._repository.listHashtagGroups(organizationId);
  }

  private cleanTags(tags: string) {
    return [
      ...new Set(
        (tags || '')
          .split(/[\s,]+/)
          .map((t) => t.trim().replace(/^#+/, ''))
          .filter(Boolean)
          .map((t) => `#${t}`)
      ),
    ].join(' ');
  }

  createHashtagGroup(organizationId: string, body: HashtagGroupDto) {
    return this._repository.createHashtagGroup(
      organizationId,
      body.name.trim() || 'Hashtags',
      this.cleanTags(body.tags)
    );
  }

  updateHashtagGroup(organizationId: string, id: string, body: HashtagGroupDto) {
    return this._repository.updateHashtagGroup(
      organizationId,
      id,
      body.name.trim() || 'Hashtags',
      this.cleanTags(body.tags)
    );
  }

  deleteHashtagGroup(organizationId: string, id: string) {
    return this._repository.deleteHashtagGroup(organizationId, id);
  }
}
