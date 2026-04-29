const reviews = [
  {
    name: "Google Customer",
    source: "Google",
    rating: 5,
    text: "Vitalii did an excellent job. He was professional, on time, and the work was done cleanly.",
  },
  {
    name: "Thumbtack Customer",
    source: "Thumbtack",
    rating: 5,
    text: "Great communication and high quality handyman work. I would definitely recommend.",
  },
  {
    name: "Google Customer",
    source: "Google",
    rating: 5,
    text: "Very reliable and detail-oriented. The project was completed exactly as discussed.",
  },
  {
    name: "Thumbtack Customer",
    source: "Thumbtack",
    rating: 5,
    text: "Fast response, fair pricing, and clean work. I will use this service again.",
  },
  {
    name: "Google Customer",
    source: "Google",
    rating: 5,
    text: "Very professional handyman service. The job was completed on time and looked great.",
  },
];

export default function Reviews() {
  return (
    <section className="bg-neutral-950 px-5 py-16 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="font-semibold text-yellow-400">Customer reviews</p>

        <h2 className="mt-2 text-3xl font-extrabold md:text-5xl">
          Trusted by Local Homeowners
        </h2>

        <p className="mt-4 max-w-2xl text-white/65">
          Reviews from Google and Thumbtack customers.
        </p>

        <p className="mt-4 max-w-2xl text-white/60">
          Top-rated handyman in Tampa Bay Area. Fast response. Reliable results.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
            <p className="text-3xl font-extrabold text-yellow-400">4.9 ★★★★★</p>
            <p className="mt-2 text-sm text-white/60">Average rating</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
            <p className="text-3xl font-extrabold">165+</p>
            <p className="mt-2 text-sm text-white/60">Customer reviews</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
            <p className="text-3xl font-extrabold">Google + Thumbtack</p>
            <p className="mt-2 text-sm text-white/60">Verified platforms</p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          <h3 className="text-xl font-bold">What customers say</h3>
          <p className="text-sm text-white/50">Swipe to view more →</p>
        </div>

        <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4">
          {reviews.map((review) => (
            <div
              key={review.text}
              className="min-w-[85%] snap-start rounded-2xl border border-white/10 bg-white/10 p-6 md:min-w-[360px]"
            >
              <div className="mb-4 text-yellow-400">
                {"★".repeat(review.rating)}
              </div>

              <p className="min-h-[120px] text-white/80">
                “{review.text}”
              </p>

              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="font-bold">{review.name}</p>
                <p className="text-sm text-white/55">
                  {review.source} Review
                </p>
              </div>
            </div>
          ))}
        </div>

        <a
          href="https://www.thumbtack.com/fl/tampa/handyman/vitalii-handypro/service/528569101242605578"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-block rounded-xl bg-yellow-400 px-6 py-4 font-bold text-black"
        >
          View verified reviews on Thumbtack
        </a>
      </div>
    </section>
  );
}