import Link from "next/link";
import { getExamUrl } from "@/lib/utils";

export default function ProviderDetail({ slug, provider, exams }) {
  if (!slug) {
    return (
      <p className="text-red-600">Provider slug is missing.</p>
    );
  }

  if (!provider) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <p className="text-red-600 text-lg font-semibold">
          Provider not found.
        </p>
        <Link
          href="/providers"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          ← Back to All Providers
        </Link>
      </div>
    );
  }

  const safeExams = Array.isArray(exams) ? exams : [];

  return (
    <div className="container mx-auto px-4 py-10">
      <Link
        href="/providers"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        ← Back to All Providers
      </Link>

      {/* Provider Info */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10">
        {provider.logoUrl && (
          <img
            src={provider.logoUrl}
            alt={provider.name}
            className="w-32 h-32 object-contain rounded-md shadow-sm"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold mb-2">{provider.name}</h1>
          <p className="text-gray-700">{provider.description}</p>
        </div>
      </div>

      {/* Exams */}
      <h2 className="text-2xl font-semibold mb-6">
        Exams by {provider.name}
      </h2>

      {safeExams.length === 0 ? (
        <p className="text-gray-500">No exams found for this provider.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {safeExams.map((exam) => (
            <div
              key={exam.slug || exam.id}
              className="border rounded-xl p-6 shadow-sm hover:shadow-lg bg-white flex flex-col justify-between"
            >
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-1">{provider.name}</p>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {exam.title || exam.name}
                </h3>
                {exam.code && (
                  <p className="text-sm text-gray-500 mb-2">{exam.code}</p>
                )}
                <p className="text-sm text-gray-600">
                  {exam.practice_tests_list?.length ||
                    exam.practice_exams ||
                    0}{" "}
                  Practice Exam
                  {(exam.practice_tests_list?.length ||
                    exam.practice_exams ||
                    0) > 1
                    ? "s"
                    : ""}{" "}
                  ·{" "}
                  {exam.practice_tests_list?.reduce(
                    (sum, t) => sum + (t.questions || 0),
                    0
                  ) ||
                    exam.questions ||
                    0}{" "}
                  Questions
                </p>
              </div>

              <Link
                href={getExamUrl(exam)}
                className="mt-auto inline-block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Start Practicing →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

