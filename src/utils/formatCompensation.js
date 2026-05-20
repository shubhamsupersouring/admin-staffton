const toCompactIndianValue = (amount) => {
  if (amount >= 1_00_00_000) {
    return { value: (amount / 1_00_00_000).toFixed(1).replace(/\.0$/, ""), unit: "Cr" }
  }

  if (amount >= 1_00_000) {
    return { value: (amount / 1_00_000).toFixed(1).replace(/\.0$/, ""), unit: "L" }
  }

  if (amount >= 1_000) {
    return { value: (amount / 1_000).toFixed(1).replace(/\.0$/, ""), unit: "K" }
  }

  return { value: amount.toString(), unit: "" }
}

export const formatCompensation = (amount, opts) => {
  if (!Number.isFinite(amount) || amount <= 0) return "N/A"

  const { value, unit } = toCompactIndianValue(amount)
  const withCurrencyPrefix = opts?.withCurrencyPrefix ?? true
  const prefix = withCurrencyPrefix ? "₹ " : ""

  return `${prefix}${value} ${unit}`.trim()
}
  