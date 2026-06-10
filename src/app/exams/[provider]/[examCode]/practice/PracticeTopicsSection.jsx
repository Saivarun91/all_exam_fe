import { Progress } from "@/components/ui/progress";

export default function PracticeTopicsSection({ topics = [], topicsHeading = "" }) {
  if (!topics.length) return null;

  return (
    <section className="mb-12 rounded-2xl border border-[#DDE7FF] bg-gradient-to-br from-[#F0F4FF] via-white to-[#F5F8FC] p-6 sm:p-8 shadow-sm">
      {topicsHeading ? (
        <div
          className="mb-6 text-[#0C1A35] border-l-4 border-[#0C1A35] pl-4"
          dangerouslySetInnerHTML={{ __html: topicsHeading }}
          suppressHydrationWarning
        />
      ) : (
        <h2 className="text-2xl sm:text-3xl font-bold text-[#0C1A35] mb-6 border-l-4 border-[#0C1A35] pl-4">
          Topics Covered
        </h2>
      )}
      <div className="space-y-5">
        {topics.map((topic, idx) => (
          <div
            key={`${topic.name}-${idx}`}
            className="rounded-xl border border-[#DDE7FF] bg-white/80 px-4 py-4 sm:px-5"
          >
            <div className="flex justify-between items-center gap-3 mb-2">
              <span className="text-sm font-semibold text-[#0C1A35]">
                {topic.name}
              </span>
              <span className="text-sm font-semibold text-[#1A73E8] whitespace-nowrap">
                {topic.labelPercentage}
              </span>
            </div>
            <Progress
              value={topic.progressValue}
              className="h-2.5 bg-[#E8EEF8] [&_[data-slot=progress-indicator]]:bg-[#0C1A35]"
            />
            {topic.explanation ? (
              <p className="text-sm text-[#0C1A35]/70 mt-2 leading-relaxed whitespace-pre-wrap">
                {topic.explanation}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
