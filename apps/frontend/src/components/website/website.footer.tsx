import Link from 'next/link';
import {
  COMPANY_ADDRESS_LINES,
  COMPANY_EMAIL,
  COMPANY_NAME,
} from '@gitroom/frontend/components/website/website.company';

export const WebsiteFooter = () => {
  return (
    <footer className="border-t border-ws-line bg-ws-deep text-[14px] text-ws-muted">
      <div className="max-w-[1200px] mx-auto px-[16px] py-[40px] grid gap-[32px] md:grid-cols-[2fr_1fr_1fr]">
        <div className="flex flex-col gap-[10px]">
          <div className="flex items-center gap-[10px]">
            <img
              src="/wrecking-social-icon-64.png"
              alt=""
              width={28}
              height={28}
              className="w-[28px] h-[28px]"
            />
            <span className="ws-display text-[17px] font-[700] text-white">
              Wrecking Social
            </span>
          </div>
          <p>{COMPANY_NAME}</p>
          <address className="not-italic">
            {COMPANY_ADDRESS_LINES.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </address>
          <a href={`mailto:${COMPANY_EMAIL}`} className="text-ws-green underline">
            {COMPANY_EMAIL}
          </a>
        </div>
        <nav className="flex flex-col gap-[10px]" aria-label="Legal">
          <div className="text-white font-[600]">Legal</div>
          <Link href="/privacy" className="hover:text-white">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white">
            Terms of Service
          </Link>
          <Link href="/data-deletion" className="hover:text-white">
            Data Deletion
          </Link>
        </nav>
        <nav className="flex flex-col gap-[10px]" aria-label="Product">
          <div className="text-white font-[600]">Product</div>
          <Link href="/#features" className="hover:text-white">
            Features
          </Link>
          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
          <Link href="/auth/login" className="hover:text-white">
            Sign in
          </Link>
        </nav>
      </div>
      <div className="max-w-[1200px] mx-auto px-[16px] pb-[32px] text-[13px]">
        © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
      </div>
    </footer>
  );
};
