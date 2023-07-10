/**
 * Vendor agnostic access to the Fullscreen API. Build with the Fullscreen API as intended without worrying about vendor prefixes.
 */
declare module 'fscreen' {

  /**
   * boolean to tell if fullscreen mode is supported
   * replacement for: document.fullscreenEnabled
   * mapped to: document.vendorMappedFullscreenEnabled
   */
  declare const fullscreenEnabled: boolean

  /**
   * null if not in fullscreen mode, or the DOM element that's in fullscreen mode
   * (if fullscreen is not supported by the device it will be undefined)
   * replacement for: document.fullscreenElement
   * mapped to: document.vendorMappedFullsceenElement
   * note that fscreen.fullscreenElement uses a getter to retrieve the element
   * each time the property is accessed.
   */
  declare let fullscreenElement: Element | undefined | null

  /**
   * replacement for: element.requestFullscreen()
   * mapped to: element.vendorMappedRequestFullscreen()
   * @param element the element to request fullscreen mode for
   */
  declare function requestFullscreen (element: Element): Promise<void>

  /**
   * replacement for: element.requestFullscreen - without calling the function
   * mapped to: element.vendorMappedRequestFullscreen
   *
   * @param element the element to request fullscreen mode for
   * @returns a function that can be called to request fullscreen mode for the element
   */
  declare function requestFullscreenFunction (element: Element): (options: FullscreenOptions) => Promise<void>

  /**
   * replacement for: document.exitFullscreen()
   * mapped to: document.vendorMappedExitFullscreen()
   * note that fscreen.exitFullscreen is mapped to
   * document.vendorMappedExitFullscreen - without calling the function
   *
   * @returns a promise that represents when the exitFullscreen request has been completed
   */
  declare function exitFullscreen (): Promise<void>

  /**
   * replacement for: document.onfullscreenchange = handler
   * mapped to: document.vendorMappedOnfullscreenchange = handler
   */
  declare let onfullscreenchange: typeof document.onfullscreenchange

  /**
   * replacement for: document.onfullscreenerror = handler
   * mapped to: document.vendorMappedOnfullscreenerror = handler
   */
  declare let onfullscreenerror: typeof document.onfullscreenerror

  /**
   * DOM events supported by the fscreen library include the following:
   * 'fullscreenchange' - fired when the fullscreen is entered or exited
   * 'fullscreenerror' - fired when an error occurs while trying to enter or exit fullscreen mode
   */
  declare type SupportedEvent = 'fullscreenchange' | 'fullscreenerror'

  /**
   * replacement for: document.addEventListener(type, handler, options)
   * mapped to: document.addEventListener('vendorMapped<eventType>', handler, options)
   *
   * @param type the event type to listen for
   * @param handler the event listener
   * @param options the event listener options
   */
  declare function addEventListener (type: SupportedEvent, handler: (this: Document, ev: Event) => any, options?: boolean | AddEventListenerOptions): void

  /**
   * replacement for: document.removeEventListener(type, handler, options)
   * mapped to: document.removeEventListener('vendorMapped<eventType>', handler, options)
   *
   * @param type the event type to remove the listener for
   * @param handler the event listener to remove
   * @param options the event listener options
   */
  declare function removeEventListener (type: SupportedEvent, handler: (this: Document, ev: Event) => any, options?: boolean | EventListenerOptions): void

  /**
   * returns the vendorMapped fullscreen Pseudo Class
   * i.e. :fullscreen, :-webkit-full-screen, :-moz-full-screen, :-ms-fullscreen
   * Can be used to find any elements that are fullscreen using the vendorMapped Pseudo Class
   * e.g. document.querySelectorAll(fscreen.fullscreenPseudoClass).forEach(...);
   */
  declare const fullscreenPseudoClass: string

}
