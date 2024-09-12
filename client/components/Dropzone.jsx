import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/solid'

const SageMakerService = require('../../server/sageMakerService');

const headingStyle = {
  margin: '0',
  fontSize: '20px'
};

const paragraphStyle = {
  margin: '5px 0',
  fontSize: '16px'
};
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const sendImageToBackend = async (base64Image) => {
  try {
    const response = await fetch('http://localhost:3003/api/invoke-sagemaker', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageBase64: base64Image }),
    });

    const result = await response.json()
    console.log(result);
    return  result;
  } catch (error) {
    console.error('Error sending image to backend:', error);
  }
};

const Dropzone = ({ className }) => {
  const [files, setFiles] = useState([])
  const [rejected, setRejected] = useState([])

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (acceptedFiles?.length) {
      acceptedFiles.map(file => convertToBase64(file)
          .then(async (base64String) => {

            try {
              const result = await sendImageToBackend(base64String);
              if (!result.accepted) {
                setRejected(prevRejected => [
                  ...prevRejected,
                  Object.assign(file, {
                    preview: URL.createObjectURL(file),
                    top_predicted_labels: result.top_predicted_labels
                  })
                ]);
              } else {
                console.log(`The image is classified as ${result.predicted_label}.`);
                setFiles(prevAccepted => [
                  ...prevAccepted,
                  Object.assign(file, {
                    preview: URL.createObjectURL(file),
                    top_predicted_labels: result.top_predicted_labels
                  })
                ]);
              }
            } catch (error) {
              console.error('Error sending image to backend:', error);
            }
          })
          .catch(error => console.error('Error converting image to Base64:', error)));
    }

  }, [])


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': [],
    },
    onDrop
  })

  useEffect(() => {
    // Revoke the data uris to avoid memory leaks
    return () => files.forEach(file => URL.revokeObjectURL(file.preview))
  }, [files])

  const removeFile = name => {
    setFiles(files => files.filter(file => file.name !== name))
    setRejected(files => files.filter(file => file.name !== name))
  }

  const removeAll = () => {
    setFiles([])
    setRejected([])
  }

  const renderJsonData = (jsonData) => {
    console.log(jsonData);
    return (
        <ul style={{  textAlign: 'left', paddingLeft: '2px', listStyleType: 'decimal',   listStylePosition: 'inside'}}>
          {Object.entries(jsonData).map(([key, value]) => (
              <li key={key} style={{fontSize: '16px'}}>
                {`${key}: ${value.toFixed(2)}`} <strong>%</strong>
              </li>
          ))}
        </ul>
    );
  };

  return (
      <form>
        <div
            {...getRootProps({
              className: className
            })}
        >
          <input {...getInputProps()} />
          <div className='flex flex-col items-center justify-center gap-4'>
            <ArrowUpTrayIcon className='w-5 h-5 fill-current'/>
            {isDragActive ? (
                <p>Drop the files here ...</p>
            ) : (
                <p>Drag & drop files here, or click to select files</p>
            )}
          </div>
        </div>

        <section className='mt-10'>
          <div className='flex gap-4'>
            <h2 className='title text-3xl font-semibold'>Preview</h2>
            <button
                type='button'
                onClick={removeAll}
                className='mt-1 text-[12px] uppercase tracking-wider font-bold text-neutral-500 border border-secondary-400 rounded-md px-3 hover:bg-secondary-400 hover:text-white transition-colors'
            >
              Remove all files
            </button>

          </div>

          {/* Accepted files */}
          <h3 className='title text-lg font-semibold text-neutral-600 mt-10 border-b pb-3'>
            Accepted Files
          </h3>
          <ul className='mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-10'>
            {files.map(((file, index) => (
                <li key={index} className='relative h-32 rounded-md shadow-lg'>
                  <div className="flip-card">
                    <div className="flip-card-inner">
                      <div className="flip-card-front">
                        <Image
                            src={file.preview}
                            alt={file.name}
                            width={100}
                            height={100}
                            onLoad={() => {
                              URL.revokeObjectURL(file.preview)
                            }}
                            className='h-full w-full object-contain rounded-md'
                        />
                      </div>
                      <div className="flip-card-back">
                        <h1 style={headingStyle}><strong>Prediction Score</strong></h1>
                        {/* Render JSON data dynamically */}
                        {renderJsonData(file.top_predicted_labels)}
                      </div>
                    </div>
                  </div>
                </li>
            )))}
          </ul>

          {/* Rejected Files */}
          <h3 className='title text-lg font-semibold text-neutral-600 mt-10 border-b pb-3'>
            Rejected Files
          </h3>
          <ul className='mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-10'>
            {rejected.map(((file, index) => (
                <li key={index} className='relative h-32 rounded-md shadow-lg'>
                  <div className="flip-card">
                    <div className="flip-card-inner">
                      <div className="flip-card-front">
                        <Image
                            src={file.preview}
                            alt={file.name}
                            width={100}
                            height={100}
                            onLoad={() => {
                              URL.revokeObjectURL(file.preview)
                            }}
                            className='h-full w-full object-contain rounded-md'
                        />
                      </div>
                      <div className="flip-card-back">
                        <h1 style={headingStyle}><strong>Prediction Score</strong></h1>
                        {/* Render JSON data dynamically */}
                        {renderJsonData(file.top_predicted_labels)}
                      </div>
                    </div>
                  </div>
                </li>
            )))}
          </ul>

        </section>
      </form>
  )
}

export default Dropzone
