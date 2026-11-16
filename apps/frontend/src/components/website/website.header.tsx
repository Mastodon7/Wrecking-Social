import Link from 'next/link';

export const WebsiteHeader = () => {
  return (
    <header className="sticky top-0 z-20 bg-ws-ink/90 backdrop-blur border-b border-ws-line">
      <div className="max-w-[1200px] mx-auto px-[16px] h-[68px] flex items-center gap-[16px]">
        <Link href="/" aria-label="Wrecking Social home" className="flex items-center gap-[10px] shrink-0">
          <img
            src="/wrecking-social-icon-64.png"
            alt=""
            width={36}
            height={36}
            className="w-[36px] h-[36px]"
          />
          <span className="ws-display text-[20px] font-[700] text-white whitespace-nowrap hidden sm:inline">
            Wrecking Social
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-[24px] text-[15px] text-ws-text ms-[24px]">
          <Link href="/#features" className="hover:text-white">
            Features
          </Link>
          <Link href="/#platforms" className="hover:text-white">
            Platforms
          </Link>
          <Link href="/#how-it-works" className="hover:text-white">
            How it works
          </Link>
          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
        </nav>
        <div className="flex-1" />
        <Link
          href="/auth/login"
          className="text-[15px] text-ws-text hover:text-white whitespace-nowrap"
        >
          Sign in
        </Link>
        <Link
          href="/auth"
          className="text-[15px] font-[600] bg-ws-green text-ws-ink px-[16px] py-[9px] rounded-[8px] hover:bg-ws-greenHover whitespace-nowrap"
        >
          Get started
        </Link>
      </div>
    </header>
  );
};
