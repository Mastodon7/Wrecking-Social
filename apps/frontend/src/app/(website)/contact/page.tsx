import Link from 'next/link';
import { Metadata } from 'next';
import {
  COMPANY_ADDRESS_LINES,
  COMPANY_EMAIL,
  COMPANY_NAME,
} from '@gitroom/frontend/components/website/website.company';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact the Wrecking Social team.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <section className="max-w-[860px] mx-auto px-[16px] py-[56px] flex flex-col gap-[24px]">
      <h1 className="ws-display text-[36px] md:text-[46px] font-[800] text-white leading-[1.1]">
        Contact Wrecking Social
      </h1>
      <p className="text-[18px] text-ws-text leading-[1.7]">
        Questions about the product, your account, billing, privacy or a data
        request? Email us and a person on our team will get back to you,
        usually within one business day.
      </p>
      <div className="grid gap-[16px] md:grid-cols-2">
        <div className="rounded-[14px] border border-ws-line bg-ws-inkSoft p-[20px] flex flex-col gap-[6px]">
          <h2 className="ws-display text-[20px] font-[700] text-white">Email</h2>
          <a
            href={`mailto:${COMPANY_EMAIL}`}
            className="text-ws-green underline text-[17px]"
          >
            {COMPANY_EMAIL}
          </a>
        </div>
        <div className="rounded-[14px] border border-ws-line bg-ws-inkSoft p-[20px] flex flex-col gap-[6px]">
          <h2 className="ws-display text-[20px] font-[700] text-white">Mailing address</h2>
          <address className="not-italic text-ws-text text-[16px] leading-[1.6]">
            {COMPANY_NAME}
            <br />
            {COMPANY_ADDRESS_LINES.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </address>
        </div>
      </div>
      <p className="text-[15px] text-ws-muted">
        Please do not email passwords or payment card numbers. To delete your
        data, see our{' '}
        <Link href="/data-deletion" className="text-ws-green underline">
          Data Deletion Instructions
        </Link>
        .
      </p>
    </section>
  );
}
