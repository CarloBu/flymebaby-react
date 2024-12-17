export class CustomEventSource extends EventSource {
  constructor(url: string, options?: EventSourceInit) {
    super(url, {
      ...options,
      withCredentials: false,
    });
  }
}
