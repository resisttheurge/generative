/**
 * A collection of color palettes used in order to easily colorize new creative coding projects.
 * New palettes will be continuously added, and all existing ones are subject to change.
 * https://kgolid.github.io/chromotome-site/
 */
declare module 'chromotome' {
  /**
   * All palette names as a union of literal types
   */
  declare type PaletteName =
    | 'frozen-rose'
    | 'winter-night'
    | 'saami'
    | 'knotberry1'
    | 'knotberry2'
    | 'tricolor'
    | 'foxshelter'
    | 'hermes'
    | 'olympia'
    | 'byrnes'
    | 'butterfly'
    | 'floratopia'
    | 'verena'
    | 'florida_citrus'
    | 'lemon_citrus'
    | 'yuma_punk'
    | 'yuma_punk2'
    | 'moir'
    | 'sprague'
    | 'bloomberg'
    | 'revolucion'
    | 'sneaker'
    | 'miradors'
    | 'kaffeprat'
    | 'jrmy'
    | 'animo'
    | 'book'
    | 'juxtapoz'
    | 'hurdles'
    | 'ludo'
    | 'riff'
    | 'san ramon'
    | 'one-dress'
    | 'rag-mysore'
    | 'rag-gol'
    | 'rag-belur'
    | 'rag-bangalore'
    | 'rag-taj'
    | 'rag-virupaksha'
    | 'retro'
    | 'retro-washedout'
    | 'roygbiv-warm'
    | 'roygbiv-toned'
    | 'present-correct'
    | 'tundra1'
    | 'tundra2'
    | 'tundra3'
    | 'tundra4'
    | 'cc239'
    | 'cc234'
    | 'cc232'
    | 'cc238'
    | 'cc242'
    | 'cc245'
    | 'cc273'
    | 'rohlfs_1R'
    | 'rohlfs_1Y'
    | 'rohlfs_1G'
    | 'rohlfs_2'
    | 'rohlfs_3'
    | 'rohlfs_4'
    | 'ducci_jb'
    | 'ducci_a'
    | 'ducci_b'
    | 'ducci_d'
    | 'ducci_e'
    | 'ducci_f'
    | 'ducci_g'
    | 'ducci_h'
    | 'ducci_i'
    | 'ducci_j'
    | 'ducci_o'
    | 'ducci_q'
    | 'ducci_u'
    | 'ducci_v'
    | 'ducci_x'
    | 'jud_playground'
    | 'jud_horizon'
    | 'jud_mural'
    | 'jud_cabinet'
    | 'iiso_zeitung'
    | 'iiso_curcuit'
    | 'iiso_airlines'
    | 'iiso_daily'
    | 'kov_01'
    | 'kov_02'
    | 'kov_03'
    | 'kov_04'
    | 'kov_05'
    | 'kov_06'
    | 'kov_06b'
    | 'kov_07'
    | 'tsu_arcade'
    | 'tsu_harutan'
    | 'tsu_akasaka'
    | 'dt01'
    | 'dt02'
    | 'dt02b'
    | 'dt03'
    | 'dt04'
    | 'dt05'
    | 'dt06'
    | 'dt07'
    | 'dt08'
    | 'dt09'
    | 'dt10'
    | 'dt11'
    | 'dt12'
    | 'dt13'
    | 'hilda01'
    | 'hilda02'
    | 'hilda03'
    | 'hilda04'
    | 'hilda05'
    | 'hilda06'
    | 'spatial01'
    | 'spatial02'
    | 'spatial02i'
    | 'spatial03'
    | 'spatial03i'
    | 'jung_bird'
    | 'jung_horse'
    | 'jung_croc'
    | 'jung_hippo'
    | 'jung_wolf'
    | 'system.#01'
    | 'system.#02'
    | 'system.#03'
    | 'system.#04'
    | 'system.#05'
    | 'system.#06'
    | 'system.#07'
    | 'system.#08'
    | 'empusa'
    | 'delphi'
    | 'mably'
    | 'nowak'
    | 'jupiter'
    | 'hersche'
    | 'cherfi'
    | 'harvest'
    | 'honey'
    | 'jungle'
    | 'skyspider'
    | 'atlas'
    | 'giftcard'
    | 'giftcard_sub'
    | 'dale_paddle'
    | 'dale_night'
    | 'dale_cat'
    | 'cako1'
    | 'cako2'
    | 'cako2_sub1'
    | 'cako2_sub2'
    | 'mayo1'
    | 'mayo2'
    | 'mayo3'
    | 'exposito'
    | 'exposito_sub1'
    | 'exposito_sub2'
    | 'exposito_sub3'

  /**
   * A palette object. All palettes have a name, an array of colors, and a size, which is equal to the length of the array of colors.
   * Palettes may also have a stroke color and a background color defined, but this is not guaranteed.
   */
  declare interface Palette {
    name: PaletteName
    colors: string[]
    size: number
    stroke?: string
    background?: string
  }

  /**
   * @returns a random palette from the collection.
   */
  declare function getRandom(): Palette

  /**
   * @param name The name of the palette to retrieve.
   * @returns a palette from the collection by name. If no name is provided, a random palette is returned.
   */
  declare function get(name?: PaletteName): Palette

  /**
   * @returns an array of all palettes in the collection.
   */
  declare function getAll(): Palette[]

  /**
   * @returns an array of all palette names in the collection.
   */
  declare function getNames(): PaletteName[]
}
