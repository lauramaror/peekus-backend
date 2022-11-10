const Promise = require("bluebird");
const { createCanvas, Image } = require("canvas");

const PARAMS = [
    { field: "sources", required: true },
    { field: "width", required: true },
    { field: "height", required: true },
    { field: "imageWidth", required: true },
    { field: "imageHeight", required: true },
    { field: "spacing", default: 0 },
    { field: "backgroundColor", default: "#eeeeee" },
    { field: "lines", default: [] },
    { field: "textStyle", default: {} },
];

function getPhoto(src) {
    if (src instanceof Buffer) {
        return src;
    } else {
        throw new Error(`Unsupported source type: ${src}`);
    }
}

module.exports = function(options) {
    if (Array.isArray(options)) {
        options = { sources: options };
    }

    PARAMS.forEach((param) => {
        if (options[param.field]) {
            return;
        } else if (param.default != null) {
            options[param.field] = param.default;
        } else if (param.required) {
            throw new Error(`Missing required option: ${param.field}`);
        }
    });

    const canvasWidth = 1080;
    const canvasHeight = 1080;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    const sources = options.sources;
    let maxImages = options.width * options.height;

    return Promise
        .map(sources, getPhoto)
        .each((photoBuffer, i) => {
            if (i >= maxImages) return;
            const img = new Image();
            img.src = photoBuffer;

            const x = (i % options.width) * (options.imageWidth + options.spacing);
            const y = Math.floor(i / options.width) * (options.imageHeight + options.spacing);
            ctx.drawImage(img, x, y, options.imageWidth, options.imageHeight);
        })
        .return(canvas);
};