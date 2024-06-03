let qrContent = "";

// Setup and Initialization
const setup = () => {
  const types = ["url", "text", "email", "sms", "wifi", "geo"];
  const errorCorrections = ["L", "M", "Q", "H"];
  setupSelectOptions(types, "qrType", "URL");
  setupSelectOptions(errorCorrections, "errorCorrection", "M");
  attachEventListeners();
  updateFields();
};

const setupSelectOptions = (options, elementId, defaultValue = "") => {
  const selectElement = document.getElementById(elementId);
  options.forEach((option) => {
    const isSelected = option === defaultValue ? "selected" : "";
    selectElement.innerHTML += `<option value="${option}" ${isSelected}>${formatOptionLabel(
      option
    )}</option>`;
  });
};

const formatOptionLabel = (option) => {
  const labels = {
    L: "Low (7% data recovery)",
    M: "Medium (15% data recovery)",
    Q: "Quartile (25% data recovery)",
    H: "High (30% data recovery)"
  };
  return `${labels[option] || option.toUpperCase()}`;
};

const updateFields = () => {
  const type = document.getElementById("qrType").value;
  qrContent = "";

  let fieldHTML = "";

  switch (type) {
    case "url":
    case "text":
    case "email":
    case "sms":
      fieldHTML = `<label for="${type}" class="form-label">${type.toUpperCase()}</label>
                             <input type="text" id="${type}" class="form-control" required>`;
      break;
    case "wifi":
      fieldHTML = `<label for="ssid" class="form-label">SSID</label>
                             <input type="text" id="ssid" class="form-control" required>
                             <label for="password" class="form-label">Password</label>
                             <input type="text" id="password" class="form-control" required>`;
      break;
    case "geo":
      fieldHTML = `<label for="latitude" class="form-label">Latitude</label>
                             <input type="text" id="latitude" class="form-control" required>
                             <label for="longitude" class="form-label">Longitude</label>
                             <input type="text" id="longitude" class="form-control" required>`;
      break;
    // Handle other types as needed
  }

  // Update the dynamicFields container with the new HTML
  document.getElementById("dynamicFields").innerHTML = fieldHTML;

  // Attach event listeners to new inputs after they are added to the DOM
  setTimeout(() => attachInputListeners(type), 0);
};

function attachInputListeners(type) {
  if (["url", "text", "email", "sms"].includes(type)) {
    document.getElementById(type).addEventListener("input", function () {
      qrContent = this.value;
      generateQRCode();
    });
  } else if (type === "wifi") {
    const ssidElement = document.getElementById("ssid");
    const passwordElement = document.getElementById("password");

    if (ssidElement && passwordElement) {
      ssidElement.addEventListener("input", updateQrContentForWifi);
      passwordElement.addEventListener("input", updateQrContentForWifi);
      updateQrContentForWifi(); // Initial update to set qrContent based on current input values
    } else {
      console.error(
        "Invalid type or corresponding input element not found:",
        type
      );
    }
  } else if (type === "geo") {
    const latitude = document.getElementById("latitude");
    const longitude = document.getElementById("longitude");
    latitude.addEventListener("input", updateQrContentForGeo);
    longitude.addEventListener("input", updateQrContentForGeo);
    // Initial call to set up QR content
    updateQrContentForGeo();
  }
}

function updateQrContentForWifi() {
  const ssid = document.getElementById("ssid")?.value; // Using optional chaining for safety
  const password = document.getElementById("password")?.value;
  qrContent = `WIFI:S:${ssid};T:WPA;P:${password};;`;
  generateQRCode();
  // Only proceed if both values are present
  if (ssid !== undefined && password !== undefined) {
    qrContent = `WIFI:S:${ssid};T:WPA;P:${password};;`;
    const exclude = "`";
    generateQRCode();
  }
}

function updateQrContentForGeo() {
  const latitude = document.getElementById("latitude").value;
  const longitude = document.getElementById("longitude").value;
  qrContent = `geo:${latitude},${longitude}`;
  generateQRCode();
  // Only proceed if both values are present
  if (latitude !== undefined && longitude !== undefined) {
    qrContent = `geo:${latitude},${longitude}`;
    generateQRCode();
  }
}

// QR Code Generation
const generateQRCode = () => {
  // QR code size and colors
  const width = document.getElementById("width").value;
  const height = document.getElementById("height").value;
  const primaryColor = document.getElementById("primaryColor").value;
  const secondaryColor = document.getElementById("secondaryColor").value;
  const errorCorrection = document.getElementById("errorCorrection").value;

  // Create SVG element for QR code
  const svgNS = "http://www.w3.org/2000/svg";
  const svgElement = document.createElementNS(svgNS, "svg");
  svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svgElement.setAttribute("xmlns", svgNS);

  // Generate QR code
  const qrcode = new QRCode({
    content: qrContent,
    padding: 0,
    width: width,
    height: height,
    color: primaryColor,
    background: secondaryColor,
    ecl: errorCorrection,
    join: true,
    pretty: true,
    swap: false,
    xmlDeclaration: true,
    container: "svg-viewbox"
  });

  const svgString = qrcode.svg();
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
  const parsedSvgElement = svgDoc.documentElement;

  parsedSvgElement.setAttribute("width", width + "px");
  parsedSvgElement.setAttribute("height", height + "px");

  // Define the paths and their attributes
  const paths = [
    {
      d:
        "M109.1,59.6c-0.7-0.7-1.7-0.9-2.6-0.7L97,61.5c-0.9,0.2-1.7,1-1.9,1.9C95,63.6,95,63.9,95,64.1c-3.9-3.5-9-5.6-14.6-5.6c-12.1,0-21.9,9.8-21.9,21.9c0,12.1,9.8,21.9,21.9,21.9c12.1,0,21.9-9.8,21.9-21.9c0-2.2-0.3-4.2-0.9-6.2l1.3-1.3l0.1,0.1c0.7,0.7,1.7,0.9,2.6,0.7c0.9-0.2,1.7-1,1.9-1.9l2.6-9.6C110,61.3,109.8,60.3,109.1,59.6z",
      fill: "#FFFFFF"
    },
    {
      d:
        "M102.4,62.8l-4.8,1.3l2,2L89.6,76.2l-2.4-2.4l-3-3L73.3,81.6l-6.2-6.2c1.8-4.8,6.2-8.4,11.6-9.1c5.5-0.7,10.7,1.9,13.6,6.2l1.3-1.3c-0.3-0.4-0.6-0.8-0.9-1.2l1.3-1.8l-3.2-2.8L89,66.9c-0.6-0.4-1.2-0.7-1.8-1l0.4-2.2l-4-1.2l-0.9,2c-0.7-0.1-1.3-0.2-2-0.2l-0.5-2.1l-4.2,0.5l0,2.2c-0.7,0.2-1.3,0.4-1.9,0.7l-1.3-1.7L69.3,66l0.9,2c-0.5,0.4-1,0.9-1.5,1.4l-1.9-1.1l-2.4,3.4l1.6,1.5c-0.3,0.6-0.6,1.2-0.8,1.9l-2.2-0.2L62.3,79l2.1,0.7c0,0.7,0,1.3,0,2l-2.1,0.7l0.9,4.1l2.2-0.3c0.2,0.6,0.5,1.2,0.8,1.8l-1.6,1.5l2.5,3.4l1.9-1.1c0.5,0.5,1,0.9,1.5,1.3l-0.8,2l3.7,2l1.3-1.8c0.6,0.2,1.3,0.4,1.9,0.6l0.1,2.2l4.2,0.4l0.4-2.2c0.3,0,0.7,0,1-0.1c0.3,0,0.7-0.1,1-0.2l0.9,2l4-1.4l-0.5-2.1c0.6-0.3,1.2-0.7,1.7-1l1.7,1.4l3.1-2.9l-1.3-1.8c0.4-0.5,0.8-1.1,1.2-1.6l2.1,0.6l1.6-3.9l-1.9-1.1c0.2-0.6,0.3-1.3,0.4-2l2.2-0.3L98.4,78l-2.2-0.2c-0.1-0.3-0.1-0.7-0.2-1l-1.5,1.5c0,0.1,0,0.3,0.1,0.4c1,7.8-4.6,14.9-12.4,15.9c-7.8,1-14.9-4.6-15.9-12.4c-0.1-0.6-0.1-1.1-0.1-1.6l7.1,7.1l0,0l0,0l10.9-10.9l2.4,2.4l3,3l3-3l10.1-10.1l2,2l1.3-4.8l1.3-4.8L102.4,62.8z",
      fill: "#295135"
    },
    {
      d:
        "M89.6,83.2l4.3-4.3c0.1,0.5,0.1,1,0.1,1.5c0,4-1.7,7.5-4.4,10L89.6,83.2L89.6,83.2z M83.8,78.2v15.4c1.7-0.4,3.2-1.2,4.6-2.2V82l-4.2-4.2L83.8,78.2z M78,93.8c0.8,0.1,1.6,0.2,2.4,0.2c0.7,0,1.5-0.1,2.2-0.2V79.4L78,83.9V93.8zM73.3,88.6l-0.5-0.5l-0.5-0.5v3.7c1.3,1,2.9,1.8,4.6,2.2v-8.4L73.3,88.6L73.3,88.6z M71,90.3v-3.9l-4.1-4.1C67.3,85.4,68.8,88.2,71,90.3z",
      fill: "#80BC00"
    }
  ];

  // Scale function
  function scalePathData(paths, originalSize, newSize) {
    const scaleFactor = newSize / originalSize;
    return paths.map((pathInfo) => {
      const { d, fill } = pathInfo;
      const scaledD = d.replace(/([0-9.]+)/g, (match) => {
        return (parseFloat(match) * scaleFactor).toFixed(3);
      });
      return { d: scaledD, fill };
    });
  }

  // Calculate scale factor based on new dimensions
  const originalSize = 160; // Original size your paths are based on
  const newSize = Math.min(width, height); // Assuming square QR codes for simplicity
  const scaledPaths = scalePathData(paths, originalSize, newSize);

  // Create the <g> element
  const gElement = document.createElementNS(svgNS, "g");

  // Scale the logo to match size
  scaledPaths.forEach((pathInfo) => {
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathInfo.d);
    path.setAttribute("fill", pathInfo.fill);
    gElement.appendChild(path);
  });

  // Append the <g> element to the parsed SVG
  parsedSvgElement.appendChild(gElement);

  // Clear any existing QR codes and display the new one
  clearQRCode();
  document.getElementById(
    "qrcode"
  ).innerHTML = new XMLSerializer().serializeToString(parsedSvgElement);
  qrActions.classList.remove("d-none");
};

// Utility Functions
const adjustDimensions = (event) => {
  const target = event.target; // Access the event's target element
  if (document.getElementById("lockSquare").checked) {
    if (target.id === "width") {
      document.getElementById("height").value = target.value;
      generateQRCodeIfNeeded();
    } else if (target.id === "height") {
      document.getElementById("width").value = target.value;
      generateQRCodeIfNeeded();
    }
  }
};

const enforceSquareDimensions = () => {
  if (document.getElementById("lockSquare").checked) {
    const width = document.getElementById("width").value;
    document.getElementById("height").value = width;
    generateQRCodeIfNeeded();
  }
};

const clearQRCode = () => {
  const qrCodeDiv = document.getElementById("qrcode");
  qrCodeDiv.innerHTML = ""; // Clear the inner HTML of the QR code container

  const qrActions = document.getElementById("qrActions");
  qrActions.classList.add("d-none"); // Optionally hide QR code actions if they're only relevant when a QR code is visible
};

const swapColors = () => {
  const primaryColor = document.getElementById("primaryColor");
  const secondaryColor = document.getElementById("secondaryColor");
  const temp = primaryColor.value;
  primaryColor.value = secondaryColor.value;
  secondaryColor.value = temp;
};

// Event Listeners
const attachEventListeners = () => {
  document.getElementById("width").addEventListener("input", function (event) {
    adjustDimensions(event);
    generateQRCodeIfNeeded();
  });
  document.getElementById("height").addEventListener("input", function (event) {
    adjustDimensions(event);
    generateQRCodeIfNeeded();
  });
  document
    .getElementById("lockSquare")
    .addEventListener("change", enforceSquareDimensions);
  document.getElementById("qrType").addEventListener("change", () => {
    clearQRCode();
    updateFields();
  });
  document.getElementById("swapColorsBtn").addEventListener("click", () => {
    swapColors();
    clearQRCode();
    generateQRCode();
  });
  document
    .querySelectorAll("#qrForm input, #qrForm select")
    .forEach((el) => el.addEventListener("input", generateQRCodeIfNeeded));
  document
    .getElementById("savePngBtn")
    .addEventListener("click", () => saveQRCode("PNG"));
  document
    .getElementById("saveSvgBtn")
    .addEventListener("click", () => saveQRCode("SVG"));
};

const generateQRCodeIfNeeded = () => {
  const type = document.getElementById("qrType")
    ? document.getElementById("qrType").value
    : null;
  const inputElement = document.getElementById(type);

  // Ensure both 'type' and the corresponding input element are valid
  if (type && inputElement) {
    const inputValue = inputElement.value;
    if (inputValue) {
      clearQRCode();
      generateQRCode();
    }
    qrActions.classList.remove("d-none");
  }
};

// Unified function to save QR Code as PNG or SVG
const saveQRCode = (format) => {
  const qrCodeDiv = document.getElementById("qrcode");
  const svgElement = qrCodeDiv.querySelector("svg");

  if (!svgElement) return;

  if (format === "PNG") {
    const image = new Image();
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8"
    });
    const url = URL.createObjectURL(svgBlob);
    image.src = url;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "QRCode.png";
      link.click();
      URL.revokeObjectURL(url);
    };
  } else if (format === "SVG") {
    const serializer = new XMLSerializer();
    const svgBlob = new Blob([serializer.serializeToString(svgElement)], {
      type: "image/svg+xml"
    });
    const url = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "qrcode.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  }
};

// Initialize everything
document.addEventListener("DOMContentLoaded", function () {
  setup();
});
