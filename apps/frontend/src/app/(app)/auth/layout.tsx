import { getT } from '@gitroom/react/translation/get.translation.service.backend';

export const dynamic = 'force-dynamic';
import { ReactNode } from 'react';
import loadDynamic from 'next/dynamic';
import { AttributionComponent } from '@gitroom/frontend/components/auth/attribution.component';
import { LogoTextComponent } from '@gitroom/frontend/components/ui/logo-text.component';
import { MantineWrapper } from '@gitroom/react/helpers/mantine.wrapper';
import { Toaster } from '@gitroom/react/toaster/toaster';
const ReturnUrlComponent = loadDynamic(() => import('./return.url.component'));
export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const t = await getT();

  return (
    <MantineWrapper>
      <Toaster />
      <div className="bg-[#0E0E0E] flex flex-1 p-[12px] gap-[12px] min-h-screen w-screen text-white">
        {/*<style>{`html, body {overflow-x: hidden;}`}</style>*/}
        <ReturnUrlComponent />
        <AttributionComponent />
        <div className="flex flex-col py-[40px] px-[20px] flex-1 lg:w-[600px] lg:flex-none rounded-[12px] text-white p-[12px] bg-[#1A1919]">
          <div className="w-full max-w-[440px] mx-auto justify-center gap-[20px] h-full flex flex-col text-white">
            <LogoTextComponent />
            <div className="flex">{children}</div>
            <div className="flex flex-wrap gap-[16px] text-[13px] text-white/60">
              <a href="/" className="hover:text-white">
                {t('ws_home', 'Home')}
              </a>
              <a href="/privacy" className="hover:text-white">
                {t('privacy_policy', 'Privacy Policy')}
              </a>
              <a href="/terms" className="hover:text-white">
                {t('terms_of_service', 'Terms of Service')}
              </a>
              <a href="/data-deletion" className="hover:text-white">
                {t('ws_data_deletion', 'Data Deletion')}
              </a>
            </div>
          </div>
        </div>
        <div className="flex-1 hidden lg:flex flex-col items-center justify-center gap-[32px] px-[40px] rounded-[12px] bg-ws-ink">
          <img
            src="/wrecking-social-wordmark.png"
            alt="Wrecking Social: Schedule It. Create It. Crush It."
            width={800}
            height={166}
            className="w-full max-w-[560px] h-auto"
          />
          <ul className="flex flex-col gap-[14px] text-[18px] text-ws-light max-w-[520px]">
            <li>
              {t(
                'ws_auth_point_schedule',
                'Plan and schedule posts for every channel from one calendar.'
              )}
            </li>
            <li>
              {t(
                'ws_auth_point_create',
                'Write, design and preview each post before it goes live.'
              )}
            </li>
            <li>
              {t(
                'ws_auth_point_team',
                'Bring your team in to draft, review and approve together.'
              )}
            </li>
          </ul>
        </div>
      </div>
    </MantineWrapper>
  );
}
