const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const preciseCurrencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

export function formatBRL(value: number): string {
  return currencyFormatter.format(value);
}

/** Para valores muito pequenos (custo por requisição), 2 casas decimais
 * arredondam tudo para R$ 0,00 — usa mais precisão. */
export function formatBRLPrecise(value: number): string {
  return preciseCurrencyFormatter.format(value);
}
