from moviepy import VideoFileClip
class ExtractAudio:
    def __init__(self, input_file, output_file):
        self.input_file = input_file
        self.output_file = output_file

    def extract(self):
        try:
            video = VideoFileClip(self.input_file)
            video.audio.write_audiofile(self.output_file)
            video.close()
        except Exception as e:
            print(f"An error occurred: {e}")


# if __name__ == "__main__":
#     input_file = "video.mp4"
#     output_file = "output_audio.mp3"
#     extractor = ExtractAudio(input_file, output_file)
#     extractor.extract()
