import { telHref } from "@/lib/utils";

interface VenueFooterProps {
  venueName: string;
  address?: string | null;
  phone?: string | null;
  /**
   * "stack" (default) is the centered phone footer. "responsive" is for wide-frame pages: from
   * 600px it becomes one row (name and address left, phone right) under a hairline.
   */
  layout?: "stack" | "responsive";
}

export function VenueFooter({ venueName, address, phone, layout = "stack" }: VenueFooterProps) {
  const responsive = layout === "responsive";
  return (
    <div
      className={`pb-4 pt-6 text-center ${
        responsive ? "cmp:flex cmp:items-start cmp:justify-between cmp:border-t cmp:border-border cmp:text-left" : ""
      }`}
    >
      <div>
        <div className="mb-1 font-serif text-card-title-sm font-medium text-foreground">
          {venueName}
        </div>
        {address && <p className="mb-1 text-body-sm text-muted-foreground">{address}</p>}
      </div>
      {phone && (
        <a
          href={telHref(phone)}
          className={`text-body-sm font-medium text-primary no-underline ${
            responsive ? "cmp:inline-flex cmp:min-h-11 cmp:items-center" : ""
          }`}
        >
          {phone}
        </a>
      )}
    </div>
  );
}
