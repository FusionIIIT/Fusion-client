// Counts write requests (POST, PUT, PATCH, DELETE) that haven't finished yet.
// A page reload cancels them, so useReloadOnNewBuild waits while any are
// pending, e.g. a course upload still sending when the user opens another page.
// It watches XMLHttpRequest, which axios uses in the browser, and fetch.

let pending = 0;

const READS = ["GET", "HEAD", "OPTIONS"];
const isWrite = (method) =>
  !READS.includes(String(method || "GET").toUpperCase());

export function pendingWrites() {
  return pending;
}

function trackXhr(XHR) {
  const { open, send } = XHR.prototype;
  XHR.prototype.open = function trackedOpen(...args) {
    this.__fusionWrite = isWrite(args[0]);
    return open.apply(this, args);
  };
  XHR.prototype.send = function trackedSend(...args) {
    if (!this.__fusionWrite) return send.apply(this, args);
    pending += 1;
    let counted = true;
    const finish = () => {
      if (counted) {
        counted = false;
        pending -= 1;
      }
    };
    this.addEventListener("loadend", finish);
    try {
      return send.apply(this, args);
    } catch (error) {
      finish();
      throw error;
    }
  };
}

function trackFetch(win) {
  const original = win.fetch;
  win.fetch = function trackedFetch(input, init) {
    if (!isWrite(init?.method ?? input?.method)) {
      return original.call(win, input, init);
    }
    pending += 1;
    let counted = true;
    const finish = () => {
      if (counted) {
        counted = false;
        pending -= 1;
      }
    };
    try {
      return original.call(win, input, init).finally(finish);
    } catch (error) {
      finish();
      throw error;
    }
  };
}

// Call once, before the app makes any request.
export function trackPendingWrites(win = window) {
  if (win.__fusionTracksWrites) return;
  win.__fusionTracksWrites = true;
  if (win.XMLHttpRequest) trackXhr(win.XMLHttpRequest);
  if (win.fetch) trackFetch(win);
}
