import { useEffect, useState } from 'react';
import { Quote, Star } from 'lucide-react';
import { api, getAssetUrl } from '../services/api';

const getInitials = (name: string) => (
  name
    .split(' ')
    .map(part => part.trim()[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
);

const getRating = (rating?: number) => {
  const safeValue = Number(rating) || 5;
  return Math.max(1, Math.min(5, safeValue));
};

export default function Testimonials() {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    api.getReviews()
      .then((result) => setReviews(Array.isArray(result) ? result : []))
      .catch(() => setReviews([]));
  }, []);

  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? (reviews.reduce((sum, review) => sum + getRating(review.rating), 0) / reviewCount).toFixed(1)
    : '0.0';

  const carouselReviews = reviews.length > 1 ? [...reviews, ...reviews] : reviews;
  const marqueeDuration = `${Math.max(reviews.length * 7, 22)}s`;

  return (
    <section className="py-18 bg-surface">
      <div className="container mx-auto px-6 text-white">
        <div className="mb-20 text-center">
          <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-accent">Testimoniale</span>
          <h2 className="text-4xl font-display font-bold text-white md:text-6xl">VOCILE <span className="text-white/30">ACADEMIEI.</span></h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-light leading-relaxed text-white/55 md:text-base">
            Experiente reale din sala, de la cursanti, parinti si sportivi care au trait ritmul, disciplina si energia Stoica Brothers Academy.
          </p>

          <div className="mx-auto mt-8 flex max-w-sm items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-left shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-black text-black">
              {averageRating}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star
                    key={starIndex}
                    size={14}
                    className={starIndex < Math.round(Number(averageRating)) ? 'fill-[#ffc700] text-[#ffc700]' : 'text-white/15'}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
                Media recenziilor
              </p>
              <p className="mt-1 text-xs text-white/45">
                Bazat pe {reviewCount} {reviewCount === 1 ? 'review' : 'review-uri'}
              </p>
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] px-8 py-12 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">Recenzii in curs</p>
            <p className="mt-4 text-white/55">
              Primele recenzii vor aparea aici in curand.
            </p>
          </div>
        ) : reviews.length === 1 ? (
          <div className="mx-auto max-w-[340px]">
            {reviews.map((review, idx) => {
              const rating = getRating(review.rating);

              return (
                <div
                  key={review._id || idx}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 md:rounded-3xl md:p-6"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <Quote className="text-accent opacity-20" size={32} />
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          size={13}
                          className={starIndex < rating ? 'fill-[#ffc700] text-[#ffc700]' : 'text-white/15'}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mb-6 h-28 overflow-y-auto pr-2 md:h-32">
                    <p className="text-sm italic font-light leading-relaxed text-white/70">
                      "{review.text}"
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {review.image ? (
                      <img
                        src={getAssetUrl(review.image)}
                        alt={review.name}
                        className="h-11 w-11 rounded-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-black text-white/55">
                        {getInitials(review.name || 'SB')}
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold tracking-tight text-white">{review.name}</h4>
                      <p className="text-[10px] uppercase tracking-widest text-accent">
                        {review.role || 'Cursant Stoica Brothers'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#0A0A0A] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#0A0A0A] to-transparent" />

            <div className="overflow-hidden">
              <div
                className="testimonials-marquee-track flex w-max gap-5 hover:[animation-play-state:paused]"
                style={{ animationDuration: marqueeDuration }}
              >
                {carouselReviews.map((review, idx) => {
                  const rating = getRating(review.rating);

                  return (
                    <div
                      key={`${review._id || review.name || 'review'}-${idx}`}
                      className="w-[280px] shrink-0 rounded-2xl border border-white/10 bg-white/5 p-5 md:w-[320px] md:rounded-3xl md:p-6 xl:w-[340px]"
                    >
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <Quote className="text-accent opacity-20" size={32} />
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              size={13}
                              className={starIndex < rating ? 'fill-[#ffc700] text-[#ffc700]' : 'text-white/15'}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mb-6 h-28 overflow-y-auto pr-2 md:h-32">
                        <p className="text-sm italic font-light leading-relaxed text-white/70">
                          "{review.text}"
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        {review.image ? (
                          <img
                            src={getAssetUrl(review.image)}
                            alt={review.name}
                            className="h-11 w-11 rounded-full object-cover object-top"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-xs font-black text-white/55">
                            {getInitials(review.name || 'SB')}
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold tracking-tight text-white">{review.name}</h4>
                          <p className="text-[10px] uppercase tracking-widest text-accent">
                            {review.role || 'Cursant Stoica Brothers'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
