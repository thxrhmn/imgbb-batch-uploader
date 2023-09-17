const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const csv = require("fast-csv");
require('dotenv').config();

const API_KEY = process.env.API_KEY;
const allFiles = [];
const uploadedFiles = [];
const csvName = "data.csv";
const dirPath = "./images";

const postImg = async (imgPath) => {
  const form = new FormData();
  const imgData = fs.readFileSync(imgPath);
  const imgPathSplit = imgPath.split("/");
  const imgName = imgPathSplit[imgPathSplit.length - 1];
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

    const obj = {
        id: response.data.data.id,
        title: response.data.data.title,
        url_viewer: response.data.data.url_viewer,
        display_url: response.data.data.display_url,
        width: response.data.data.width,
        height: response.data.data.height,
        time: response.data.data.time,
        expiration: response.data.data.expiration,
        image_filename: response.data.data.image.filename,
        image_name: response.data.data.image.name, 
        image_mime: response.data.data.image.mime, 
        image_extension: response.data.data.image.extension, 
        image_url: response.data.data.image.url, 
        thumb_filename: response.data.data.thumb.filename,
        thumb_name: response.data.data.thumb.name, 
        thumb_mime: response.data.data.thumb.mime, 
        thumb_extension: response.data.data.thumb.extension, 
        thumb_url: response.data.data.thumb.url, 
        medium_filename: response.data.data.medium.filename,
        medium_name: response.data.data.medium.name, 
        medium_mime: response.data.data.medium.mime, 
        medium_extension: response.data.data.medium.extension, 
        medium_url: response.data.data.thumb.url, 
        delete_url: response.data.data.delete_url, 
    }

    uploadedFiles.push(obj)

    if (uploadedFiles.length === allFiles.length){
        saveToCsv(csvName, uploadedFiles)
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

const getFilesInDir = (folderPath) => {
  // Membaca isi folder
  fs.readdir(folderPath, async (err, files) => {
    if (err) {
      console.error("Terjadi kesalahan:", err);
      return;
    }

    // Menampilkan daftar file dalam folder
    files.forEach((file) => {
      allFiles.push(file);
    });

    console.log("allfiles:: ", allFiles);

    for (const file of allFiles) {
        await postImg(`./images/${file}`);
      }
  });

};

getFilesInDir(dirPath);
