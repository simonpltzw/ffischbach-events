export const ab2str = (buf: ArrayBuffer) => {
  return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
};

// https://stackoverflow.com/questions/21797299/how-can-i-convert-a-base64-string-to-arraybuffer
export const str2ab = (str: string) => {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return bytes.buffer;
};

export const getLocalDateTime = (dateStr: string): string => {
  const date: Date = new Date(dateStr);
  const result = `${date.toLocaleDateString(["de"], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  return !isNaN(date.getTime()) ? result : "";
};

export const getLocalDate = (dateStr: string): string => {
  const date: Date = new Date(dateStr);
  // const result = date.toLocaleDateString(["de"], {
  //   day: "2-digit",
  //   month: "2-digit",
  //   year: "numeric",
  // });

  const year = date.getFullYear().toString().padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${day}.${month}.${year}`;
};

export const parseJwt = (token: string) => {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
};

export const getDateTime = (str: string) => {
  const result = new Date(str);

  const timeStr = result.toLocaleTimeString(["de"], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return !isNaN(result.getTime()) ? result.toISOString().slice(0, 11) + timeStr : "";
};
