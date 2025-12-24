import React from 'react';
import {Link} from 'react-router';
import {Button} from '~/components/ui/button';
import {motion} from 'motion/react';

interface EmptyResultProps {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

export function EmptyResult({
  title = 'No results found',
  description = "We couldn't find any items matching your criteria.",
  ctaText = 'Continue shopping',
  ctaLink = '/',
}: EmptyResultProps) {
  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.5}}
      className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-2xl mx-auto my-12 rounded-lg bg-background/50 backdrop-blur-sm"
    >
      <motion.h2
        className="text-2xl font-bold mb-4"
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 0.3}}
      >
        {title}
      </motion.h2>
      <motion.p
        className="text-muted-foreground mb-8 max-w-md"
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{delay: 0.4}}
      >
        {description}
      </motion.p>
      <motion.div
        initial={{opacity: 0, y: 10}}
        animate={{opacity: 1, y: 0}}
        transition={{delay: 0.5}}
      >
        <Link to={ctaLink}>
          <Button size="lg" variant="gradient">
            {ctaText}
          </Button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
