import Image from "next/image";

const MobileAppPromo = () => {
  return (
    <section className="w-full px-6 md:px-10 lg:px-16 xl:px-20 py-16 bg-white">
      <div className="relative w-full bg-[#E8F5F3] rounded-3xl overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch">
          {/* Phone Image */}
          <div className="relative w-[220px] md:w-[260px] lg:w-[300px] shrink-0 -mb-2 lg:mb-0 lg:ml-10 xl:ml-16">
            <div className="relative w-full h-[320px] md:h-[380px] lg:h-[420px] mt-8 lg:mt-6">
              <Image
                src="/images/landingPage/phone.png"
                alt="Ormeet Mobile App"
                fill
                className="object-contain object-bottom"
                sizes="300px"
                priority
              />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 px-6 md:px-10 py-8 lg:py-12 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl text-black leading-tight mb-4">
              <span className="font-bold">Book. Manage. Attend —</span>
              <br />
              All from Your Phone
            </h2>
            <p className="text-sm md:text-base text-muted leading-relaxed max-w-md mb-6">
              Book tickets, access your QR code, and get real-time
              updates — all in one place. Fast, easy, and made for
              event day!
            </p>
            {/* App Store Badges */}
            <div className="flex items-center gap-3">
              {/* Apple App Store */}
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2.5 hover:bg-[#333333] transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[8px] leading-none">Download on the</span>
                  <span className="text-sm font-semibold leading-tight">App Store</span>
                </div>
              </a>
              {/* Google Play */}
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-black text-white rounded-lg px-4 py-2.5 hover:bg-[#333333] transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 010 1.38l-2.302 2.302L15.396 13l2.302-2.492zM5.864 2.658L16.8 9.991l-2.302 2.302L5.864 2.658z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-[8px] leading-none">GET IT ON</span>
                  <span className="text-sm font-semibold leading-tight">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* QR Code */}
          <div className="hidden lg:flex flex-col items-center justify-center pr-10 xl:pr-16 py-12">
            <span className="text-xs text-muted font-medium mb-3 whitespace-nowrap">
              Scan to Get the App
            </span>
            <div className="w-[120px] h-[120px] bg-white rounded-xl p-2 shadow-sm">
              {/* QR Code placeholder using SVG pattern */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <rect width="100" height="100" fill="white" />
                {/* Top-left finder */}
                <rect x="5" y="5" width="25" height="25" fill="black" />
                <rect x="8" y="8" width="19" height="19" fill="white" />
                <rect x="11" y="11" width="13" height="13" fill="black" />
                {/* Top-right finder */}
                <rect x="70" y="5" width="25" height="25" fill="black" />
                <rect x="73" y="8" width="19" height="19" fill="white" />
                <rect x="76" y="11" width="13" height="13" fill="black" />
                {/* Bottom-left finder */}
                <rect x="5" y="70" width="25" height="25" fill="black" />
                <rect x="8" y="73" width="19" height="19" fill="white" />
                <rect x="11" y="76" width="13" height="13" fill="black" />
                {/* Data modules */}
                <rect x="35" y="5" width="5" height="5" fill="black" />
                <rect x="45" y="5" width="5" height="5" fill="black" />
                <rect x="55" y="5" width="5" height="5" fill="black" />
                <rect x="35" y="15" width="5" height="5" fill="black" />
                <rect x="50" y="15" width="5" height="5" fill="black" />
                <rect x="60" y="15" width="5" height="5" fill="black" />
                <rect x="35" y="25" width="5" height="5" fill="black" />
                <rect x="45" y="25" width="5" height="5" fill="black" />
                <rect x="55" y="25" width="5" height="5" fill="black" />
                <rect x="5" y="35" width="5" height="5" fill="black" />
                <rect x="15" y="35" width="5" height="5" fill="black" />
                <rect x="25" y="35" width="5" height="5" fill="black" />
                <rect x="40" y="35" width="5" height="5" fill="black" />
                <rect x="50" y="35" width="5" height="5" fill="black" />
                <rect x="65" y="35" width="5" height="5" fill="black" />
                <rect x="75" y="35" width="5" height="5" fill="black" />
                <rect x="85" y="35" width="5" height="5" fill="black" />
                <rect x="5" y="45" width="5" height="5" fill="black" />
                <rect x="20" y="45" width="5" height="5" fill="black" />
                <rect x="35" y="45" width="5" height="5" fill="black" />
                <rect x="45" y="45" width="5" height="5" fill="black" />
                <rect x="60" y="45" width="5" height="5" fill="black" />
                <rect x="75" y="45" width="5" height="5" fill="black" />
                <rect x="90" y="45" width="5" height="5" fill="black" />
                <rect x="10" y="55" width="5" height="5" fill="black" />
                <rect x="25" y="55" width="5" height="5" fill="black" />
                <rect x="40" y="55" width="5" height="5" fill="black" />
                <rect x="55" y="55" width="5" height="5" fill="black" />
                <rect x="70" y="55" width="5" height="5" fill="black" />
                <rect x="85" y="55" width="5" height="5" fill="black" />
                <rect x="5" y="60" width="5" height="5" fill="black" />
                <rect x="15" y="60" width="5" height="5" fill="black" />
                <rect x="35" y="60" width="5" height="5" fill="black" />
                <rect x="50" y="60" width="5" height="5" fill="black" />
                <rect x="65" y="60" width="5" height="5" fill="black" />
                <rect x="80" y="60" width="5" height="5" fill="black" />
                <rect x="35" y="70" width="5" height="5" fill="black" />
                <rect x="45" y="70" width="5" height="5" fill="black" />
                <rect x="60" y="70" width="5" height="5" fill="black" />
                <rect x="75" y="70" width="5" height="5" fill="black" />
                <rect x="90" y="70" width="5" height="5" fill="black" />
                <rect x="35" y="80" width="5" height="5" fill="black" />
                <rect x="50" y="80" width="5" height="5" fill="black" />
                <rect x="65" y="80" width="5" height="5" fill="black" />
                <rect x="80" y="80" width="5" height="5" fill="black" />
                <rect x="35" y="90" width="5" height="5" fill="black" />
                <rect x="45" y="90" width="5" height="5" fill="black" />
                <rect x="55" y="90" width="5" height="5" fill="black" />
                <rect x="70" y="90" width="5" height="5" fill="black" />
                <rect x="85" y="90" width="5" height="5" fill="black" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileAppPromo;
