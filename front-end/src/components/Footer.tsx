import { useTranslation } from 'react-i18next';
import Logo from '../assets/Svgs/navbar/Logo.svg';
import FooterBg from '../assets/imges/footer.png';

const Footer = () => {
  const { t } = useTranslation('common');
  return (
    <div className="w-full">
      {/* Footer Content - Full width, positioned above image */}
      <footer className="w-full bg-white border-t border-[#EEEEEE]">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo and Description - Takes more space */}
          <div className="md:col-span-1">
            {/* Logo */}
            <div className="flex items-center gap-2 mb-4">
              <img src={Logo} alt={t('footer.company.title')} className="w-6 h-8" />
              <span className="text-xl font-bold text-black">Ormeet</span>
            </div>
            
            {/* Description */}
            <p className="text-sm text-[#4F4F4F] leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            
            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              {/* Facebook */}
              <a href="#" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-[#FF4000] transition-colors">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              
              {/* Instagram */}
              <a href="#" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-[#FF4000] transition-colors">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              
              {/* X (Twitter) */}
              <a href="#" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-[#FF4000] transition-colors">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              
              {/* LinkedIn */}
              <a href="#" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-[#FF4000] transition-colors">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              
              {/* YouTube */}
              <a href="#" className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-[#FF4000] transition-colors">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Browse Events Column */}
          <div>
            <h3 className="text-base font-semibold text-black mb-4">{t('footer.browseEvents.title')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.browseEvents.music')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.browseEvents.sports')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.browseEvents.business')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.browseEvents.fitness')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.browseEvents.nightlife')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.browseEvents.holiday')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.browseEvents.dating')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.browseEvents.festival')}</a></li>
            </ul>
          </div>
          
          {/* Host Events Column */}
          <div>
            <h3 className="text-base font-semibold text-black mb-4">{t('footer.hostEvents.title')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.hostEvents.createEvents')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.hostEvents.features')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.hostEvents.pricing')}</a></li>
            </ul>
            
            <h3 className="text-base font-semibold text-black mb-4 mt-6">{t('footer.support.title')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.support.helpCenter')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.support.findTickets')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.support.contactOrganizer')}</a></li>
            </ul>
          </div>
          
          {/* Company Column */}
          <div>
            <h3 className="text-base font-semibold text-black mb-4">{t('footer.company.title')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.company.aboutUs')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.company.contactUs')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.company.blog')}</a></li>
            </ul>
          </div>
          
          {/* Legal Column */}
          <div>
            <h3 className="text-base font-semibold text-black mb-4">{t('footer.legal.title')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.legal.termsOfService')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.legal.privacyPolicy')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.legal.cookiePolicy')}</a></li>
              <li><a href="#" className="text-sm text-[#4F4F4F] hover:text-[#FF4000] transition-colors">{t('footer.legal.refundCancellation')}</a></li>
            </ul>
          </div>
          </div>
        </div>
        
        {/* Copyright Section */}
        <div className="border-t border-[#EEEEEE]">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <p className="text-sm text-[#4F4F4F] text-center">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
      
      {/* Footer Background Image - Final element of the page, full width */}
      {/* Background color matches footer for visual continuity */}
      <div className="w-full bg-white flex items-center justify-center overflow-hidden" style={{ height: '280px' }}>
        <img 
          src={FooterBg} 
          alt="Ormeet" 
          className="h-full object-contain"
        />
      </div>
    </div>
  );
};

export default Footer;
