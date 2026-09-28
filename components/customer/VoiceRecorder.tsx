"use client";

import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Play, Pause, Volume2, AlertCircle } from "lucide-react";

interface VoiceRecorderProps {
  onAudioRecorded: (file: File | null) => void;
}

export default function VoiceRecorder({ onAudioRecorded }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage("আপনার ডিভাইসে মাইক্রোফোন রেকর্ডিং সাপোর্ট করছে না।");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine supported mime type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? "audio/mp4"
        : "";

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert Blob to File
        const ext = mimeType.includes("mp4") ? "m4a" : "webm";
        const file = new File([audioBlob], `bazar-voice-note.${ext}`, {
          type: mimeType || "audio/webm",
          lastModified: Date.now(),
        });
        onAudioRecorded(file);

        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200); // 200ms slices
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Mic access error:", err);
      setErrorMessage(
        "মাইক্রোফোন পারমিশন প্রয়োজন। দয়া করে ব্রাউজারে মাইক্রোফোন ব্যবহারের অনুমতি দিন।"
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecordingDuration(0);
    setIsPlaying(false);
    onAudioRecorded(null);
  };

  const togglePlayback = () => {
    if (!audioElementRef.current) return;

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      {errorMessage && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!audioUrl && !isRecording && (
        <div className="text-center py-6 px-4 bg-emerald-50/50 rounded-2xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 transition-colors">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mb-3 shadow-sm">
            <Mic className="w-8 h-8" />
          </div>
          <h4 className="font-semibold text-gray-900 text-sm mb-1">
            মুখে বলে বাজারের লিস্ট দিন
          </h4>
          <p className="text-xs text-gray-500 mb-4 max-w-xs mx-auto">
            বাটনে চাপ দিয়ে স্পষ্ট করে পণ্যের নাম ও পরিমাণ বলুন (যেমন: &quot;১ কেজি পেঁয়াজ, ১ ডজন ডিম&quot;)
          </p>
          <button
            type="button"
            onClick={startRecording}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span>ভয়েস রেকর্ড শুরু করুন</span>
          </button>
        </div>
      )}

      {isRecording && (
        <div className="py-6 px-4 bg-red-50/80 rounded-2xl border-2 border-red-300 text-center animate-pulse">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-3">
            <Mic className="w-8 h-8 animate-bounce" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
            <span className="font-bold text-red-700 text-base">
              রেকর্ডিং হচ্ছে... ({formatTime(recordingDuration)})
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-4">
            লিস্ট বলা শেষ হলে নিচের বাটনটি চাপুন
          </p>
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Square className="w-4 h-4 fill-white" />
            <span>রেকর্ড শেষ করুন</span>
          </button>
        </div>
      )}

      {audioUrl && !isRecording && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs sm:text-sm">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>আপনার ভয়েস রেকর্ড সংরক্ষিত হয়েছে</span>
            </div>
            <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              {formatTime(recordingDuration)}
            </span>
          </div>

          <audio
            ref={audioElementRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayback}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>থামুন</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>রেকর্ডটি শুনুন</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={deleteRecording}
              className="p-2.5 bg-white hover:bg-red-50 text-red-600 border border-gray-200 hover:border-red-200 rounded-xl transition-colors cursor-pointer"
              title="রেকর্ড মুছে ফেলুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
