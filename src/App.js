import React, { useState, useRef, useEffect } from 'react';

export default function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoDuration, setVideoDuration] = useState('01:00');
  const [currentTime, setCurrentTime] = useState('00:00');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [videoSize, setVideoSize] = useState({ 
    width: 640, 
    height: 360 
  });
  const [videoPosition, setVideoPosition] = useState({ 
    x: 0, 
    y: 0 
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  // New state for start and end times
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('01:00');

  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const timerRef = useRef(null);

  // Convert time string to seconds
  const timeToSeconds = (timeString) => {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setVideoFile(fileURL);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      const durationString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setVideoDuration(durationString);
      setEndTime(durationString);
    }
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      clearInterval(timerRef.current);
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      const startSeconds = timeToSeconds(startTime);
      const endSeconds = timeToSeconds(endTime);
      videoRef.current.currentTime = startSeconds;

      videoRef.current.play();
      setIsPlaying(true);

      timerRef.current = setInterval(() => {
        const current = videoRef.current.currentTime;
        const minutes = Math.floor(current / 60);
        const seconds = Math.floor(current % 60);
        const currentTimeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setCurrentTime(currentTimeString);

        // Stop video if reached end time
        if (current >= endSeconds) {
          videoRef.current.pause();
          setIsPlaying(false);
          clearInterval(timerRef.current);
        }
      }, 1000);
    }
  };

  const startDrag = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setStartPos({ 
      x: e.clientX - videoPosition.x, 
      y: e.clientY - videoPosition.y 
    });
  };

  const doDrag = (e) => {
    if (!isDragging) return;
    setVideoPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  const startResize = (e) => {
    e.preventDefault();
    setIsResizing(true);
    setStartPos({ 
      x: e.clientX, 
      y: e.clientY 
    });
    setStartSize({
      width: videoSize.width,
      height: videoSize.height
    });
  };

  const doResize = (e) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    // Maintain aspect ratio
    const aspectRatio = videoSize.width / videoSize.height;
    const newWidth = Math.max(200, startSize.width + deltaX);
    const newHeight = Math.max(100, newWidth / aspectRatio);

    setVideoSize({
      width: newWidth,
      height: newHeight
    });
  };

  const stopResize = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', doDrag);
      document.addEventListener('mouseup', stopDrag);
    }
    if (isResizing) {
      document.addEventListener('mousemove', doResize);
      document.addEventListener('mouseup', stopResize);
    }

    return () => {
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isDragging, isResizing]);

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div className='w-20 border border-l-2'>
        <div className="  mt-5 ml-3  w-12 h-12 rounded-[10px] flex items-center justify-center bg-linear-to-b from-neutral-50 to-neutral-100 transition-shadow shadow-[0_0_3px_0_rgba(0,0,0,0.15),0_2px_6px_0_rgba(0,0,0,0.15),inset_0_1px_2px_0_rgba(255,255,255,1),inset_0_-1px_2px_0_rgba(0,0,0,0.25)] hover:shadow-[0_2px_8px_0_rgba(0,0,0,0.18),0_1px_5px_0_rgba(0,0,0,0.12),inset_0_1px_2px_0_rgba(255,255,255,1),inset_0_-1px_2px_0_rgba(0,0,0,0.25)] active:shadow-[0_1px_4px_0_rgba(0,0,0,0.12),0_0_2px_0_rgba(0,0,0,0.12),inset_0_1px_2px_0_rgba(255,255,255,1),inset_0_-1px_1px_0_rgba(0,0,0,0.25)]">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="16" fill="none" viewBox="0 0 20 16">
            <path fill="#323232" d="m19.987.875-5.392 13.223a2.01 2.01 0 0 1-1.863 1.252h-5.45a2.01 2.01 0 0 1-1.861-1.25L.012.875A.163.163 0 0 1 .164.65h5.458c.136 0 .258.084.306.212l4.088 10.9L14.07.862a.33.33 0 0 1 .306-.212h5.46c.116 0 .194.118.15.225"></path>
          </svg>
        </div>
        <div className="group mt-6 ml-2  w-[60px] h-[60px] relative cursor-pointer flex flex-col justify-center items-center select-none font-normal text-neutral-600 hover:text-neutral-600 hover:no-underline" data-testid="@editor/brand-kits" aria-disabled="false" draggable="false" href="/edit/e1a4f5d0-2757-477d-a193-8a5d6931b798/brand-kits"><div className="w-10 h-10 rounded-full flex justify-center items-center bg-transparent group-hover:bg-neutral-500/10">
         <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" class="text-gray-200 group-hover:text-gray-300">
         <g filter="url(#brand-kit_svg__a)"><path fill="currentColor" d="M0 9.6c0-3.36 0-5.04.654-6.324A6 6 0 0 1 3.276.654C4.56 0 6.24 0 9.6 0h4.8c3.36 0 5.04 0 6.324.654a6 6 0 0 1 2.622 2.622C24 4.56 24 6.24 24 9.6v4.8c0 3.36 0 5.04-.654 6.324a6 6 0 0 1-2.622 2.622C19.44 24 17.76 24 14.4 24H9.6c-3.36 0-5.04 0-6.324-.654a6 6 0 0 1-2.622-2.622C0 19.44 0 17.76 0 14.4z"></path><path fill="url(#brand-kit_svg__b)" fill-opacity="0.2" d="M0 9.6c0-3.36 0-5.04.654-6.324A6 6 0 0 1 3.276.654C4.56 0 6.24 0 9.6 0h4.8c3.36 0 5.04 0 6.324.654a6 6 0 0 1 2.622 2.622C24 4.56 24 6.24 24 9.6v4.8c0 3.36 0 5.04-.654 6.324a6 6 0 0 1-2.622 2.622C19.44 24 17.76 24 14.4 24H9.6c-3.36 0-5.04 0-6.324-.654a6 6 0 0 1-2.622-2.622C0 19.44 0 17.76 0 14.4z"></path>
         </g>
         <g filter="url(#brand-kit_svg__c)"><path fill="#fff" d="M12.69 17.685c-.257.253-.386.379-.395.49a.3.3 0 0 0 .103.253c.084.072.265.072.627.072H16.1c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656c.163-.32.163-.74.163-1.58v-1.2c0-.84 0-1.261-.163-1.582a1.5 1.5 0 0 0-.35-.448c-.07-.061-.105-.092-.173-.11a.35.35 0 0 0-.182.01c-.066.025-.11.071-.196.164-1.518 1.638-3.15 3.183-4.746 4.75"></path></g><g filter="url(#brand-kit_svg__d)"><path fill="#fff" d="M12.998 14.089c0 .363.001.544.073.628a.3.3 0 0 0 .252.104c.11-.009.238-.137.495-.394l2.188-2.187c.594-.594.89-.891 1.002-1.234a1.5 1.5 0 0 0 0-.927c-.111-.342-.408-.64-1.002-1.233l-.849-.849c-.594-.594-.891-.891-1.233-1.002a1.5 1.5 0 0 0-.599-.068c-.088.008-.131.012-.19.046a.35.35 0 0 0-.118.13c-.03.061-.03.12-.029.24z"></path></g>
         <g filter="url(#brand-kit_svg__e)"><path fill="#fff" fill-rule="evenodd" d="M5.663 6.319c-.163.32-.163.74-.163 1.581v7.6a3 3 0 1 0 6 0V7.9c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C10.361 5.5 9.941 5.5 9.1 5.5H7.9c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656M8.5 17.25a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5" clip-rule="evenodd"></path></g><defs><filter id="brand-kit_svg__a" width="24" height="24" x="0" y="0" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="0.5">\
         </feOffset><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"></feComposite><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0"></feColorMatrix><feBlend in2="shape" result="effect1_innerShadow_22531_1782"></feBlend></filter><filter id="brand-kit_svg__c" width="12.207" height="11.747" x="9.293" y="11.253" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix">
         </feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="1.5"></feOffset><feGaussianBlur stdDeviation="1.5"></feGaussianBlur><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"></feColorMatrix><feBlend in2="BackgroundImageFix" mode="multiply" result="effect1_dropShadow_22531_1782"></feBlend><feBlend in="SourceGraphic" in2="effect1_dropShadow_22531_1782" result="shape"></feBlend></filter><filter id="brand-kit_svg__d" width="10.093" height="13.901" x="9.988" y="5.421" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="1.5"></feOffset><feGaussianBlur stdDeviation="1.5"></feGaussianBlur><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"></feColorMatrix><feBlend in2="BackgroundImageFix" mode="multiply" result="effect1_dropShadow_22531_1782"></feBlend><feBlend in="SourceGraphic" in2="effect1_dropShadow_22531_1782" result="shape"></feBlend></filter><filter id="brand-kit_svg__e" width="12" height="19" x="2.5" y="4" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="1.5"></feOffset><feGaussianBlur stdDeviation="1.5"></feGaussianBlur><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"></feColorMatrix><feBlend in2="BackgroundImageFix" mode="multiply" result="effect1_dropShadow_22531_1782"></feBlend><feBlend in="SourceGraphic" in2="effect1_dropShadow_22531_1782" result="shape"></feBlend></filter>
         <linearGradient id="brand-kit_svg__b" x1="12" x2="12" y1="0" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#fff"></stop><stop offset="1" stop-color="#fff" stop-opacity="0"></stop></linearGradient></defs></svg></div><span class="mt-1 whitespace-nowrap text-xxs font-medium">Brand Kit</span></div>
        <div className="group mt-6 ml-2 w-[60px] h-[60px] relative cursor-pointer flex flex-col justify-center items-center select-none font-medium text-blue-600 active" data-testid="@editor/media" aria-disabled="false" draggable="false" href="/edit/e1a4f5d0-2757-477d-a193-8a5d6931b798/media"><div class="w-10 h-10 rounded-full flex justify-center items-center bg-light-blue">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" class="text-primary"><g fill-rule="evenodd" clip-rule="evenodd" filter="url(#video_svg__a)">
        <path fill="currentColor" d="M9.601 0c-3.36 0-5.04 0-6.324.654A6 6 0 0 0 .654 3.276C0 4.56.001 6.24.001 9.601v4.8c0 3.36.001 5.04.655 6.323a6 6 0 0 0 2.622 2.622C4.562 24 6.242 24 9.602 24H14.4c3.36 0 5.04 0 6.324-.654a6 6 0 0 0 2.622-2.622C24 19.44 24 17.76 24 14.4V9.6c0-3.36 0-5.04-.654-6.324A6 6 0 0 0 20.725.654C19.44 0 17.76 0 14.4 0z"></path>
        <path fill="url(#video_svg__b)" fill-opacity="0.2" d="M9.601 0c-3.36 0-5.04 0-6.324.654A6 6 0 0 0 .654 3.276C0 4.56.001 6.24.001 9.601v4.8c0 3.36.001 5.04.655 6.323a6 6 0 0 0 2.622 2.622C4.562 24 6.242 24 9.602 24H14.4c3.36 0 5.04 0 6.324-.654a6 6 0 0 0 2.622-2.622C24 19.44 24 17.76 24 14.4V9.6c0-3.36 0-5.04-.654-6.324A6 6 0 0 0 20.725.654C19.44 0 17.76 0 14.4 0z"></path></g>
        <g filter="url(#video_svg__c)"><path fill="#fff" d="M16 12.8c0 .44 0 .66.058.862.05.179.135.347.247.495.127.167.303.299.655.563l.48.36c.824.618 1.236.927 1.58.92a1 1 0 0 0 .767-.383C20 15.345 20 14.83 20 13.8v-3.6c0-1.03 0-1.545-.213-1.816A1 1 0 0 0 19.021 8c-.345-.007-.757.302-1.581.92l-.48.36c-.352.264-.528.396-.655.563a1.5 1.5 0 0 0-.247.495C16 10.54 16 10.76 16 11.2z"></path></g>
        <g filter="url(#video_svg__d)"><path fill="#fff" d="M5 10.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C6.52 7 7.08 7 8.2 7h3.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C15 8.52 15 9.08 15 10.2v3.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C13.48 17 12.92 17 11.8 17H8.2c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C5 15.48 5 14.92 5 13.8z"></path></g><defs><filter id="video_svg__a" width="24" height="24" x="0.001" y="0" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="0.5"></feOffset><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"></feComposite><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0"></feColorMatrix><feBlend in2="shape" result="effect1_innerShadow_22531_1628"></feBlend></filter><filter id="video_svg__c" width="8" height="12" x="14" y="7" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="1"></feOffset><feGaussianBlur stdDeviation="1"></feGaussianBlur><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"></feColorMatrix><feBlend in2="BackgroundImageFix" mode="multiply" result="effect1_dropShadow_22531_1628"></feBlend><feBlend in="SourceGraphic" in2="effect1_dropShadow_22531_1628" result="shape"></feBlend></filter><filter id="video_svg__d" width="14" height="14" x="3" y="6" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="1"></feOffset><feGaussianBlur stdDeviation="1"></feGaussianBlur><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"></feColorMatrix><feBlend in2="BackgroundImageFix" mode="multiply" result="effect1_dropShadow_22531_1628"></feBlend><feBlend in="SourceGraphic" in2="effect1_dropShadow_22531_1628" result="shape"></feBlend></filter><linearGradient id="video_svg__b" x1="12" x2="12" y1="0" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#fff"></stop><stop offset="1" stop-color="#fff" stop-opacity="0"></stop>
        </linearGradient></defs>
        </svg></div><span class="mt-1 whitespace-nowrap text-xxs font-medium">Video</span>
        </div>
        <div className="group mt-6 ml-2 w-[60px] h-[60px] relative cursor-pointer flex flex-col justify-center items-center select-none font-normal text-neutral-600 hover:text-neutral-600 hover:no-underline" data-testid="@editor/audio" aria-disabled="false" draggable="false" href="/edit/e1a4f5d0-2757-477d-a193-8a5d6931b798/media-audio">
          <div className="w-10 h-10 rounded-full flex justify-center items-center bg-transparent group-hover:bg-neutral-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" class="text-gray-200 group-hover:text-gray-300"><g filter="url(#audio_svg__a)"><path fill="currentColor" d="M0 9.6c0-3.36 0-5.04.654-6.324A6 6 0 0 1 3.276.654C4.56 0 6.24 0 9.6 0h4.8c3.36 0 5.04 0 6.324.654a6 6 0 0 1 2.622 2.622C24 4.56 24 6.24 24 9.6v4.8c0 3.36 0 5.04-.654 6.324a6 6 0 0 1-2.622 2.622C19.44 24 17.76 24 14.4 24H9.6c-3.36 0-5.04 0-6.324-.654a6 6 0 0 1-2.622-2.622C0 19.44 0 17.76 0 14.4z"></path><path fill="url(#audio_svg__b)" fill-opacity="0.2" d="M0 9.6c0-3.36 0-5.04.654-6.324A6 6 0 0 1 3.276.654C4.56 0 6.24 0 9.6 0h4.8c3.36 0 5.04 0 6.324.654a6 6 0 0 1 2.622 2.622C24 4.56 24 6.24 24 9.6v4.8c0 3.36 0 5.04-.654 6.324a6 6 0 0 1-2.622 2.622C19.44 24 17.76 24 14.4 24H9.6c-3.36 0-5.04 0-6.324-.654a6 6 0 0 1-2.622-2.622C0 19.44 0 17.76 0 14.4z"></path></g><g filter="url(#audio_svg__c)"><path fill="#fff" d="M13 16.507V8.893a1 1 0 0 1 .876-.992l2.248-.28A1 1 0 0 0 17 6.627V5.1a1 1 0 0 0-1.085-.996l-2.912.247a2 2 0 0 0-1.83 2.057l.24 7.456a3 3 0 1 0 1.586 2.724l.001-.073z"></path></g><defs><filter id="audio_svg__a" width="24" height="24" x="0" y="0" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="0.5"></feOffset><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"></feComposite><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0"></feColorMatrix><feBlend in2="shape" result="effect1_innerShadow_22531_1167"></feBlend></filter><filter id="audio_svg__c" width="14" height="19.411" x="5" y="3.1" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
        <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="1"></feOffset><feGaussianBlur stdDeviation="1"></feGaussianBlur><feComposite in2="hardAlpha" operator="out"></feComposite><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"></feColorMatrix><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_22531_1167"></feBlend><feBlend in="SourceGraphic" in2="effect1_dropShadow_22531_1167" result="shape"></feBlend></filter><linearGradient id="audio_svg__b" x1="12" x2="12" y1="0" y2="24" gradientUnits="userSpaceOnUse">
          <stop stop-color="#fff"></stop><stop offset="1" stop-color="#fff" stop-opacity="0"></stop></linearGradient></defs></svg></div>
          <span className="mt-1 whitespace-nowrap text-xxs font-medium">Audio</span></div>
        <div className="group mt-6 ml-2 w-[60px] h-[60px] relative cursor-pointer flex flex-col justify-center items-center select-none font-normal text-neutral-600 hover:text-neutral-600 hover:no-underline" data-testid="@editor/subtitles" aria-disabled="false" draggable="false" href="/edit/e1a4f5d0-2757-477d-a193-8a5d6931b798/subtitles">
          <div className="w-10 h-10 rounded-full flex justify-center items-center bg-transparent group-hover:bg-neutral-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" class="text-gray-200 group-hover:text-gray-300"><g filter="url(#subtitles_svg__a)"><path fill="currentColor" d="M0 9.6c0-3.36 0-5.04.654-6.324A6 6 0 0 1 3.276.654C4.56 0 6.24 0 9.6 0h4.8c3.36 0 5.04 0 6.324.654a6 6 0 0 1 2.622 2.622C24 4.56 24 6.24 24 9.6v4.8c0 3.36 0 5.04-.654 6.324a6 6 0 0 1-2.622 2.622C19.44 24 17.76 24 14.4 24H9.6c-3.36 0-5.04 0-6.324-.654a6 6 0 0 1-2.622-2.622C0 19.44 0 17.76 0 14.4z"></path><path fill="url(#subtitles_svg__b)" fill-opacity="0.2" d="M0 9.6c0-3.36 0-5.04.654-6.324A6 6 0 0 1 3.276.654C4.56 0 6.24 0 9.6 0h4.8c3.36 0 5.04 0 6.324.654a6 6 0 0 1 2.622 2.622C24 4.56 24 6.24 24 9.6v4.8c0 3.36 0 5.04-.654 6.324a6 6 0 0 1-2.622 2.622C19.44 24 17.76 24 14.4 24H9.6c-3.36 0-5.04 0-6.324-.654a6 6 0 0 1-2.622-2.622C0 19.44 0 17.76 0 14.4z"></path></g><g filter="url(#subtitles_svg__c)"><rect width="16" height="3" x="4" y="17" fill="#fff" rx="1.5"></rect></g><defs><filter id="subtitles_svg__a" width="24" height="24" x="0" y="0" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="0.5"></feOffset><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic">
        </feComposite><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0"></feColorMatrix><feBlend in2="shape" result="effect1_innerShadow_22531_369"></feBlend></filter><filter id="subtitles_svg__c" width="20" height="7" x="2" y="16" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse">
          <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="1"></feOffset><feGaussianBlur stdDeviation="1"></feGaussianBlur><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"></feColorMatrix><feBlend in2="BackgroundImageFix" mode="multiply" result="effect1_dropShadow_22531_369"></feBlend><feBlend in="SourceGraphic" in2="effect1_dropShadow_22531_369" result="shape"></feBlend></filter>
          <linearGradient id="subtitles_svg__b" x1="12" x2="12" y1="0" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#fff"></stop><stop offset="1" stop-color="#fff" stop-opacity="0"></stop></linearGradient></defs>
          </svg></div><span className="mt-1 whitespace-nowrap text-xxs font-medium">Subtitles</span></div>
        <div className="group mt-6 ml-2 w-[60px] h-[60px] relative cursor-pointer flex flex-col justify-center items-center select-none font-normal text-neutral-600 hover:text-neutral-600 hover:no-underline" data-testid="@editor/text" aria-disabled="false" draggable="false" href="/edit/e1a4f5d0-2757-477d-a193-8a5d6931b798/text">
          <div className="w-10 h-10  rounded-full flex justify-center items-center bg-transparent group-hover:bg-neutral-500/10">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 24" class="text-gray-200 group-hover:text-gray-300"><g filter="url(#text_svg__a)"><path fill="currentColor" d="M0 9.6c0-3.36 0-5.04.654-6.324A6 6 0 0 1 3.276.654C4.56 0 6.24 0 9.6 0h4.8c3.36 0 5.04 0 6.324.654a6 6 0 0 1 2.622 2.622C24 4.56 24 6.24 24 9.6v4.8c0 3.36 0 5.04-.654 6.324a6 6 0 0 1-2.622 2.622C19.44 24 17.76 24 14.4 24H9.6c-3.36 0-5.04 0-6.324-.654a6 6 0 0 1-2.622-2.622C0 19.44 0 17.76 0 14.4z"></path><path fill="url(#text_svg__b)" fill-opacity="0.2" d="M0 9.6c0-3.36 0-5.04.654-6.324A6 6 0 0 1 3.276.654C4.56 0 6.24 0 9.6 0h4.8c3.36 0 5.04 0 6.324.654a6 6 0 0 1 2.622 2.622C24 4.56 24 6.24 24 9.6v4.8c0 3.36 0 5.04-.654 6.324a6 6 0 0 1-2.622 2.622C19.44 24 17.76 24 14.4 24H9.6c-3.36 0-5.04 0-6.324-.654a6 6 0 0 1-2.622-2.622C0 19.44 0 17.76 0 14.4z"></path></g><g filter="url(#text_svg__c)">
        <path fill="#fff" d="M6 7.5A1.5 1.5 0 0 0 7.5 9h3v7.5a1.5 1.5 0 0 0 3 0V9h3a1.5 1.5 0 0 0 0-3h-9A1.5 1.5 0 0 0 6 7.5"></path>
        </g><defs><filter id="text_svg__a" width="24" height="24" x="0" y="0" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="0.5"></feOffset><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"></feComposite><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0"></feColorMatrix><feBlend in2="shape" result="effect1_innerShadow_22531_113"></feBlend></filter><filter id="text_svg__c" width="16" height="16" x="4" y="5" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="1"></feOffset><feGaussianBlur stdDeviation="1"></feGaussianBlur><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"></feColorMatrix><feBlend in2="BackgroundImageFix" mode="multiply" result="effect1_dropShadow_22531_113"></feBlend><feBlend in="SourceGraphic" in2="effect1_dropShadow_22531_113" result="shape"></feBlend></filter><linearGradient id="text_svg__b" x1="12" x2="12" y1="0" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#fff"></stop>
        <stop offset="1" stop-color="#fff" stop-opacity="0"></stop></linearGradient></defs>
        </svg></div>
        <span className="mt-1 whitespace-nowrap text-xxs font-medium">Text</span></div>
        <div className="group w-[60px] h-[60px] relative cursor-pointer flex flex-col justify-center items-center select-none font-normal text-neutral-600 hover:text-neutral-600 hover:no-underline" data-testid="@editor/elements" aria-disabled="false" draggable="false" href="/edit/e1a4f5d0-2757-477d-a193-8a5d6931b798/elements">
        <div className="w-10 h-10 mt-7 ml-2 rounded-full flex justify-center items-center bg-transparent group-hover:bg-neutral-500/10">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 24 25" class="text-gray-200 group-hover:text-gray-300"><g filter="url(#elements_svg__a)"><path fill="currentColor" d="M0 9.6c0-3.36 0-5.04.654-6.324A6 6 0 0 1 3.276.654C4.56 0 6.24 0 9.6 0h4.8c3.36 0 5.04 0 6.324.654a6 6 0 0 1 2.622 2.622C24 4.56 24 6.24 24 9.6v3.424c0 1.467 0 2.2-.166 2.891a6 6 0 0 1-.718 1.735c-.371.605-.89 1.124-1.928 2.162l-1.376 1.376c-1.038 1.038-1.557 1.557-2.162 1.928a6 6 0 0 1-1.735.718c-.69.166-1.424.166-2.891.166H9.6c-3.36 0-5.04 0-6.324-.654a6 6 0 0 1-2.622-2.622C0 19.44 0 17.76 0 14.4z"></path><path fill="url(#elements_svg__b)" fill-opacity="0.2" d="M0 9.6c0-3.36 0-5.04.654-6.324A6 6 0 0 1 3.276.654C4.56 0 6.24 0 9.6 0h4.8c3.36 0 5.04 0 6.324.654a6 6 0 0 1 2.622 2.622C24 4.56 24 6.24 24 9.6v3.424c0 1.467 0 2.2-.166 2.891a6 6 0 0 1-.718 1.735c-.371.605-.89 1.124-1.928 2.162l-1.376 1.376c-1.038 1.038-1.557 1.557-2.162 1.928a6 6 0 0 1-1.735.718c-.69.166-1.424.166-2.891.166H9.6c-3.36 0-5.04 0-6.324-.654a6 6 0 0 1-2.622-2.622C0 19.44 0 17.76 0 14.4z"></path></g><g filter="url(#elements_svg__c)"><path fill="#fff" d="M18.365 14H15.92c-.672 0-1.008 0-1.265.13a1.2 1.2 0 0 0-.524.525C14 14.912 14 15.248 14 15.92v2.445c0 1.454 0 2.18.288 2.517a1.2 1.2 0 0 0 1.006.417c.441-.035.955-.549 1.984-1.577l2.444-2.444c1.028-1.028 1.542-1.542 1.577-1.984a1.2 1.2 0 0 0-.417-1.007C20.546 14 19.82 14 18.365 14"></path></g><defs><filter id="elements_svg__a" width="24" height="24" x="0" y="0" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="0.5"></feOffset><feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic"></feComposite><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0"></feColorMatrix><feBlend in2="shape" result="effect1_innerShadow_22531_673"></feBlend></filter><filter id="elements_svg__c" width="11.303" height="11.303" x="12" y="13" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix><feOffset dy="1"></feOffset><feGaussianBlur stdDeviation="1"></feGaussianBlur><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"></feColorMatrix><feBlend in2="BackgroundImageFix" mode="multiply" result="effect1_dropShadow_22531_673"></feBlend><feBlend in="SourceGraphic" in2="effect1_dropShadow_22531_673" result="shape"></feBlend></filter><linearGradient id="elements_svg__b" x1="12" x2="12" y1="0" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="#fff"></stop><stop offset="1" stop-color="#fff" stop-opacity="0"></stop></linearGradient></defs></svg>
        </div><span className="mt-1 ml-3 whitespace-nowrap text-xxs font-medium">Elements</span></div>
        <div className="group w-[60px] ml-2 mt-7 h-[60px] relative cursor-pointer flex flex-col justify-center items-center select-none font-normal text-neutral-600 hover:text-neutral-600 hover:no-underline" data-testid="@editor/settings" aria-disabled="false" draggable="false" href="/edit/e1a4f5d0-2757-477d-a193-8a5d6931b798/settings">
          <div className="w-10 h-10 rounded-full flex justify-center items-center bg-transparent group-hover:bg-neutral-500/10">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-gray-200 group-hover:text-gray-300"><g filter="url(#filter0_i_23453_9291)"><path d="M0 9.6C0 6.23969 0 4.55953 0.653961 3.27606C1.2292 2.14708 2.14708 1.2292 3.27606 0.653961C4.55953 0 6.23969 0 9.6 0H14.4C17.7603 0 19.4405 0 20.7239 0.653961C21.8529 1.2292 22.7708 2.14708 23.346 3.27606C24 4.55953 24 6.23969 24 9.6V14.4C24 17.7603 24 19.4405 23.346 20.7239C22.7708 21.8529 21.8529 22.7708 20.7239 23.346C19.4405 24 17.7603 24 14.4 24H9.6C6.23969 24 4.55953 24 3.27606 23.346C2.14708 22.7708 1.2292 21.8529 0.653961 20.7239C0 19.4405 0 17.7603 0 14.4V9.6Z" fill="currentColor"></path><path d="M0 9.6C0 6.23969 0 4.55953 0.653961 3.27606C1.2292 2.14708 2.14708 1.2292 3.27606 0.653961C4.55953 0 6.23969 0 9.6 0H14.4C17.7603 0 19.4405 0 20.7239 0.653961C21.8529 1.2292 22.7708 2.14708 23.346 3.27606C24 4.55953 24 6.23969 24 9.6V14.4C24 17.7603 24 19.4405 23.346 20.7239C22.7708 21.8529 21.8529 22.7708 20.7239 23.346C19.4405 24 17.7603 24 14.4 24H9.6C6.23969 24 4.55953 24 3.27606 23.346C2.14708 22.7708 1.2292 21.8529 0.653961 20.7239C0 19.4405 0 17.7603 0 14.4V9.6Z" fill="url(#paint0_linear_23453_9291)" fill-opacity="0.2"></path></g><g filter="url(#filter1_d_23453_9291)"><path fill-rule="evenodd" clip-rule="evenodd" d="M8.76684 6.16526C9.94469 5.52696 10.5336 5.20781 11.1597 5.0829C11.7137 4.97237 12.2863 4.97237 12.8403 5.0829C13.4664 5.20781 14.0553 5.52696 15.2332 6.16526L15.2332 6.16526L15.7668 6.45447C16.9447 7.09277 17.5336 7.41192 17.9619 7.85842C18.3409 8.25348 18.6272 8.71889 18.8022 9.22448C19 9.79589 19 10.4342 19 11.7108V12.2892C19 13.5658 19 14.2041 18.8022 14.7755C18.6272 15.2811 18.3409 15.7465 17.9619 16.1416C17.5336 16.5881 16.9447 16.9072 15.7668 17.5455L15.2332 17.8347L15.2331 17.8348C14.0553 18.473 13.4664 18.7922 12.8403 18.9171C12.2863 19.0276 11.7137 19.0276 11.1597 18.9171C10.5336 18.7922 9.9447 18.473 8.76686 17.8348L8.76684 17.8347L8.23316 17.5455C7.05531 16.9072 6.46638 16.5881 6.03807 16.1416C5.6591 15.7465 5.37282 15.2811 5.1978 14.7755C5 14.2041 5 13.5658 5 12.2892V11.7108C5 10.4342 5 9.79589 5.1978 9.22448C5.37282 8.71889 5.6591 8.25348 6.03807 7.85842C6.46638 7.41192 7.05531 7.09277 8.23316 6.45447L8.76684 6.16526ZM12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="white"></path></g><defs><filter id="filter0_i_23453_9291" x="0" y="0" width="24" height="24" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix><feOffset dy="0.5"></feOffset><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"></feComposite><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0"></feColorMatrix><feBlend mode="normal" in2="shape" result="effect1_innerShadow_23453_9291"></feBlend></filter><filter id="filter1_d_23453_9291" x="3" y="4" width="18" height="18" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"></feColorMatrix><feOffset dy="1"></feOffset><feGaussianBlur stdDeviation="1"></feGaussianBlur><feComposite in2="hardAlpha" operator="out"></feComposite><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"></feColorMatrix><feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_23453_9291"></feBlend><feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_23453_9291" result="shape"></feBlend></filter><linearGradient id="paint0_linear_23453_9291" x1="12" y1="0" x2="12" y2="24" gradientUnits="userSpaceOnUse"><stop stop-color="white"></stop><stop offset="1" stop-color="white" stop-opacity="0">
        </stop></linearGradient></defs>
        </svg></div>
        <span className="mt-1 whitespace-nowrap text-xxs font-medium">Settings</span></div>
      </div>
      <div className="w-80 bg-white border-r p-4 space-y-4">
        <h2 className="text-xl font-bold">Add Media</h2>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500 mb-2">Drag & drop a file</p>
            <p className="text-gray-400 text-sm mb-4">or</p>
            <input 
              type="file" 
              accept="video/*" 
              className="hidden" 
              id="videoUpload"
              onChange={handleFileUpload}
            />
            <label 
              htmlFor="videoUpload" 
              className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
            >
              Upload a File
            </label>
          </div>
        </div>

        {/* New Start and End Time Inputs */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Video Time Range</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm mb-1">Start Time</label>
              <input 
                type="text" 
                value={startTime}
                onChange={(e) => {
                  const newStartTime = e.target.value;
                  // Basic validation for MM:SS format
                  if (/^\d{2}:\d{2}$/.test(newStartTime)) {
                    setStartTime(newStartTime);
                  }
                }}
                placeholder="00:00"
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">End Time</label>
              <input 
                type="text" 
                value={endTime}
                onChange={(e) => {
                  const newEndTime = e.target.value;
                  // Basic validation for MM:SS format
                  if (/^\d{2}:\d{2}$/.test(newEndTime)) {
                    setEndTime(newEndTime);
                  }
                }}
                placeholder="01:00"
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Resize Video</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm mb-1">Width</label>
              <input 
                type="number" 
                value={Math.round(videoSize.width)}
                onChange={(e) => {
                  const newWidth = parseInt(e.target.value) || 200;
                  const aspectRatio = videoSize.height / videoSize.width;
                  setVideoSize({
                    width: newWidth,
                    height: Math.round(newWidth * aspectRatio)
                  });
                }}
                min="200"
                max="1920"
                className="w-full border rounded px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Height</label>
              <input 
                type="number" 
                value={Math.round(videoSize.height)}
                onChange={(e) => {
                  const newHeight = parseInt(e.target.value) || 100;
                  const aspectRatio = videoSize.width / videoSize.height;
                  setVideoSize({
                    width: Math.round(newHeight * aspectRatio),
                    height: newHeight
                  });
                }}
                min="100"
                max="1080"
                className="w-full border rounded px-2 py-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div 
        ref={videoContainerRef}
        className="flex-1 bg-gray-100 p-4 flex flex-col relative overflow-hidden pb-24"
      >
        {videoFile ? (
          <div 
            className="absolute bg-black"
            style={{
              width: videoSize.width,
              height: videoSize.height,
              left: videoPosition.x,
              top: videoPosition.y,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            <div 
              className="absolute inset-0 z-10"
              onMouseDown={startDrag}
            >
              <video 
                ref={videoRef} 
                src={videoFile} 
                className="w-full h-full object-contain" 
                onLoadedMetadata={handleLoadedMetadata}
              />
              <div className="absolute bottom-2 right-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                Drag to Move
              </div>
            </div>
            <div 
              className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize z-20"
              onMouseDown={startResize}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-black flex items-center justify-center rounded-lg">
            <p className="text-gray-400">No video loaded</p>
          </div>
        )}

        {/* Minimalist Playbar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white py-2 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {/* Previous track */}} 
                className="text-gray-600 hover:bg-gray-100 p-1 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 19 2 12 11 5 11 19"></polygon>
                  <polygon points="22 19 13 12 22 5 22 19"></polygon>
                </svg>
              </button>

              <button 
                onClick={handlePlayPause} 
                className="text-gray-600 hover:bg-gray-100 p-1 rounded"
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                )}
              </button>

              <button 
                onClick={() => {/* Next track */}} 
                className="text-gray-600 hover:bg-gray-100 p-1 rounded"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 19 22 12 13 5 13 19"></polygon>
                  <polygon points="2 19 11 12 2 5 2 19"></polygon>
                </svg>
              </button>
            </div>

            <div className="text-gray-600 text-sm">
              {currentTime} / {videoDuration}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
