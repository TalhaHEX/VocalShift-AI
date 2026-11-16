from moviepy import VideoFileClip, AudioFileClip

def replace_audio(video_path,audio_path,output_path):
    # Load the video file
    video = VideoFileClip(video_path)

    # Load the new audio file
    new_audio = AudioFileClip(audio_path)

    # Set the new audio to the video
    video_with_new_audio = video.with_audio(new_audio)

    # Write the result to a new file
    video_with_new_audio.write_videofile(output_path, codec='libx264', audio_codec='aac')

    # Close the clips to release resources
    video.close()
    new_audio.close()

if __name__ == "__main__":
    video_path = "video.mp4"
    audio_path = "final_audio.mp3"
    output_path = "output_video.mp4"
    replace_audio(video_path, audio_path, output_path)
