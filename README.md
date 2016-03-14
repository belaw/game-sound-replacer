# game-sound-replacer

Replace game sound files with randomly selected custom ones

## Command-line arguments

**-i (folder name)** Input folder. The files in this folder will be randomly selected and copied to the output folder.

**-o (folder name)** Output folder. The files in this folder will be overwritten by the files in the input folder.

**-s (seed)** The seed to be used for randomly selecting the input files. Can be a number or a string. Keep in mind that the random selection also depends on the contents of the input folder.
