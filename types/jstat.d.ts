declare module 'jstat' {
  declare namespace jStat {
    declare namespace chisquare {
      declare function cdf(x: number, df: number): number
      declare function inv(p: number, df: number): number
    }
  }

  export = jStat
}
