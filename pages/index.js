import React, { useState } from "react";
import Head from "next/head";
import { useDropzone } from "react-dropzone";
import styles from "../styles/Home.module.css";
import axios from "axios";
import { Transformation, Image } from "cloudinary-react";

export default function Home() {
  const [uploadVideo, setUploadVideo] = useState("");
  const [publicId, setPublicId] = useState("");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState("");

  const { getRootProps, getInputProps } = useDropzone({
    accept: "video/*",
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      setFileName(file.name);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setUploadVideo(reader.result);
      };

      reader.onerror = () => {
        console.error("Error has Occured");
      };
    },
  });

  const convert = async () => {
    setProgress("Converting Video to GIF");

    const res = await axios.post("/api/uploadVideo", {
      videoDataUrl: uploadVideo,
    });
    const data = await res.data;

    setPublicId(data);
    if (res.statusText == "OK") {
      setProgress("Converted to GIF Successfully");
    }
  };
  const download = () => {
    setProgress("Downloading GIF");

    axios({
      method: "get",
      url: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/video/upload/fl_lossy/q_auto:low/${publicId}.gif`,
      responseType: "blob",
    })
      .then((response) => {
        var link = document.createElement("a");
        link.href = window.URL.createObjectURL(response.data);
        link.download = fileName + ".gif";

        document.body.appendChild(link);

        link.click();
        setProgress("GIF Downloaded");

        setTimeout(function () {
          window.URL.revokeObjectURL(link);
        }, 200);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const clear = async () => {
    await setFileName("");
    await setProgress("");
    await setUploadVideo("");
    const res = await axios.post("/api/deleteVideo", {
      publicId,
    });
    const data = await res.data;
    await console.log(data);
    await setPublicId("");
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Video 2 GIF Converter</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Video 2 GIF Converter</h1>

        <div className={styles.card} {...getRootProps()}>
          <input {...getInputProps()} />
          {fileName ? (
            <div>
              <p>Selected Video: {fileName}.</p> <p>{progress}</p>
            </div>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
        </div>
        <div className={styles.grid}>
          <button className={styles.btn} onClick={convert}>
            Convert
          </button>
          <button className={styles.btn} onClick={download}>
            Download
          </button>
          <button className={styles.btn} onClick={clear}>
            Clear
          </button>
        </div>
        {publicId && (
          <Image
            format="gif"
            cloudName={process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}
            publicId={publicId + ".gif"}
            resourceType="video"
            width="600"
            height="auto"
          >
            <Transformation flags="lossy" />
            <Transformation quality="auto:low" />
            <Transformation effect="loop" />
          </Image>
        )}
      </main>
    </div>
  );
}
