export function TecnologiaStellar() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 border-t border-border px-4 pt-8 text-center">
      <p className="text-sm text-muted-foreground">Realizado con tecnología de Stellar</p>
      <a
        href="https://developers.stellar.org/docs/tools/sdks"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://cdn.jsdelivr.net/npm/simple-icons@13/icons/stellar.svg"
          alt=""
          width={18}
          height={18}
          className="size-[18px] dark:invert"
        />
        Stellar SDK
      </a>
    </div>
  )
}
