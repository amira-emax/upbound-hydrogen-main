function HeroQuote({
  description,
  caption,
}: {
  description: string;
  caption: string;
}) {
  return (
    <div className="my-8 mx-auto max-w-[800px]">
      <h1 className="md:whitespace-pre-line mb-8">{description}</h1>
      <p className="typo-p-large">{caption}</p>
    </div>
  );
}

export default HeroQuote;
