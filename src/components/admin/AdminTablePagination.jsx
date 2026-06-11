"use client";

import { Button } from "@/components/ui/button";

export const ADMIN_TABLE_PAGE_SIZE = 10;

export default function AdminTablePagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  itemLabel = "items",
}) {
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
      <span className="text-sm text-gray-600">
        {totalPages > 1
          ? `Page ${currentPage} of ${totalPages} (${totalItems} ${itemLabel})`
          : `${totalItems} ${itemLabel}`}
      </span>
      {totalPages > 1 && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
