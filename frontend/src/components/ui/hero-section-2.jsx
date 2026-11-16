'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Globe, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

function InfoIcon({ type }) {
  const icons = {
    website: <Globe className="h-4 w-4 text-brand-ink" aria-hidden="true" />,
    phone: <Phone className="h-4 w-4 text-brand-ink" aria-hidden="true" />,
    address: <MapPin className="h-4 w-4 text-brand-ink" aria-hidden="true" />,
  };

  return (
    <span className="mr-2.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft ring-1 ring-line">
      {icons[type] || icons.website}
    </span>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { y: 14, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
};

export const HeroSection = React.forwardRef(function HeroSection(
  {
    className,
    logo,
    slogan,
    title,
    titleId = 'hero-title',
    subtitle,
    callToAction,
    backgroundImage,
    contactInfo,
    children,
    ...props
  },
  ref
) {
  return (
    <motion.section
      ref={ref}
      className={cn(
        'scroll-mt-24 relative flex w-full flex-col overflow-hidden rounded-panel border border-line bg-surface/85 backdrop-blur-md text-content shadow-card md:flex-row md:min-h-[540px]',
        className
      )}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      {...props}
    >
      {/* Left Column: Editorial Content & Search */}
      <div className="flex w-full flex-col justify-between gap-8 p-6 sm:p-8 md:w-1/2 md:p-10 lg:w-[56%] lg:p-14">
        <div>
          {logo ? (
            <motion.div className="mb-8 flex items-center gap-3" variants={itemVariants}>
              {logo.url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={logo.url}
                  alt={logo.alt || 'Logo platform'}
                  className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-brand/70 shadow-sm"
                />
              ) : null}
              <div className="min-w-0">
                {logo.text ? (
                  <p className="truncate text-lg font-extrabold tracking-tight text-content">
                    {logo.text}
                  </p>
                ) : null}
                {slogan ? (
                  <p className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-ink">
                    {slogan}
                  </p>
                ) : null}
              </div>
            </motion.div>
          ) : null}

          <motion.div variants={itemVariants}>
            <h1
              id={titleId}
              className="text-balance text-3xl font-extrabold leading-[1.15] tracking-tight text-content sm:text-4xl lg:text-5xl"
            >
              {title}
            </h1>
            <div className="my-5 h-1.5 w-16 rounded-full bg-brand" aria-hidden="true" />
            {subtitle ? (
              <p className="mb-6 max-w-xl text-sm leading-relaxed text-content-muted sm:text-base">
                {subtitle}
              </p>
            ) : null}

            {children ? <div className="mb-6">{children}</div> : null}

            {callToAction ? (
              <a
                href={callToAction.href}
                className="inline-flex items-center gap-1.5 rounded-sm py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-ink transition-colors duration-200 hover:text-brand-ink/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink/40 sm:text-sm"
              >
                <span>{callToAction.text}</span>
              </a>
            ) : null}
          </motion.div>
        </div>

        {/* Bottom Contact / Operational Info Strip */}
        {contactInfo ? (
          <motion.div
            className="grid grid-cols-1 gap-4 border-t border-line pt-5 text-xs text-content-muted sm:grid-cols-3 sm:gap-3"
            variants={itemVariants}
          >
            {contactInfo.website ? (
              <div className="flex min-w-0 items-center">
                <InfoIcon type="website" />
                <span className="truncate font-medium text-content">{contactInfo.website}</span>
              </div>
            ) : null}
            {contactInfo.phone ? (
              <div className="flex min-w-0 items-center">
                <InfoIcon type="phone" />
                <span className="truncate font-medium text-content">{contactInfo.phone}</span>
              </div>
            ) : null}
            {contactInfo.address ? (
              <div className="flex min-w-0 items-center">
                <InfoIcon type="address" />
                <span className="truncate font-medium text-content">{contactInfo.address}</span>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </div>

      {/* Right Column: Visual Feature Panel with Diagonal Clip-Path Reveal */}
      <motion.div
        className="relative min-h-[240px] w-full overflow-hidden bg-gradient-to-br from-chrome via-surface to-primary/30 sm:min-h-[300px] md:min-h-full md:w-1/2 lg:w-[44%]"
        initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
        animate={{ clipPath: 'polygon(14% 0, 100% 0, 100% 100%, 0% 100%)' }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        {backgroundImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden="true"
          />
        ) : null}
        <div
          className="absolute inset-0 bg-gradient-to-tr from-canvas/60 via-transparent to-primary/20"
          aria-hidden="true"
        />
      </motion.div>
    </motion.section>
  );
});

HeroSection.displayName = 'HeroSection';

