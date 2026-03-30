interface VenueFooterProps {
  venueName: string;
  address?: string | null;
  phone?: string | null;
}

export function VenueFooter({ venueName, address, phone }: VenueFooterProps) {
  return (
    <div className="pb-4 pt-6 text-center">
      <div className="mb-1 font-serif text-sm font-medium text-foreground">
        {venueName}
      </div>
      {address && <p className="mb-1 text-[13px] text-muted-foreground">{address}</p>}
      {phone && (
        <a
          href={`tel:${phone.replace(/\D/g, "")}`}
          className="text-[13px] font-medium text-primary no-underline"
        >
          {phone}
        </a>
      )}
    </div>
  );
}
