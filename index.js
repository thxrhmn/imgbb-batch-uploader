const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const csv = require("fast-csv");
require("dotenv").config();

let allFiles = [];
const API_KEY = process.env.API_KEY;
const uploadedFiles = [];
const csvName = "data.csv";
const dirPath = "./images";

const postImg = async (imgPath) => {
  const form = new FormData();
  const imgData = fs.readFileSync(imgPath);
  const imgName = imgPath.split("/").pop();
  form.append("image", imgData, { filename: imgName });

  try {
    const response = await axios.post("https://api.imgbb.com/1/upload", form, {
      params: {
        expiration: "600",
        key: API_KEY,
      },
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log(
      `${response.data.status} | ${response.data.success} | ${response.data.data.display_url}`
    );

    const { data: responseData } = response.data;

    const {
      id,
      title,
      url_viewer,
      display_url,
      width,
      height,
      time,
      expiration,
      image,
      thumb,
      medium,
      delete_url,
    } = responseData;

    const obj = {
      id,
      title,
      url_viewer,
      display_url,
      width,
      height,
      time,
      expiration,
      image_filename: image.filename,
      image_name: image.name,
      image_mime: image.mime,
      image_extension: image.extension,
      image_url: image.url,
      thumb_filename: thumb.filename,
      thumb_name: thumb.name,
      thumb_mime: thumb.mime,
      thumb_extension: thumb.extension,
      thumb_url: thumb.url,
      medium_filename: medium.filename,
      medium_name: medium.name,
      medium_mime: medium.mime,
      medium_extension: medium.extension,
      medium_url: medium.url,
      delete_url,
    };

    uploadedFiles.push(obj);

    if (uploadedFiles.length === allFiles.length) {
      saveToCsv(csvName, uploadedFiles);
    }
  } catch (err) {
    console.log(err);
  }
};

const saveToCsv = (filename, arrData) => {
  const csvStream = csv.format({ headers: true });

  // Membuat write stream untuk menulis ke file CSV
  const writableStream = fs.createWriteStream(filename);

  csvStream.pipe(writableStream);

  arrData.forEach((data) => {
    csvStream.write(data);
  });

  csvStream.end();

  writableStream.on("finish", () => {
    console.log(`Data berhasil disimpan di file ${filename}`);
  });

  writableStream.on("error", (err) => {
    console.error("Terjadi kesalahan saat menyimpan data ke file CSV:", err);
  });
};

const getFilesInDir = async (folderPath) => {
  // Membaca isi folder
  try {
    const files = await fs.promises.readdir(folderPath);
    allFiles = files;
    console.log("allfiles:: ", files);

    for (const file of files) {
      await postImg(`${folderPath}/${file}`);
    }
  } catch (err) {
    console.error("Terjadi kesalahan:", err);
  }
};

getFilesInDir(dirPath);
