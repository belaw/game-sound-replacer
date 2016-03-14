# Game Sound Replacer

Replace game sound files with randomly selected custom ones

## Usage

Simply run the node application!
```shell
$ node game-sound-replacer.js
```

This will scan `input/` and it's subdirectories for files and use them to replace *all files* in `output/` and it's subdirectories.

### Example

#### Contents of `input/`
```
custom1.wav
custom2.wav
custom3.wav
readme.txt
```

#### Contents of `output/`
```
soundtrack.wav
weapons/pistol.wav
weapons/grenade/explode1.wav
sound.cache
```

#### Results

Upon running Game Sound Replacer, the contents of all files in `output/` **including `sound.cache`** will be replaced with the contents of either `custom1.wav`, `custom2.wav`, `custom3.wav` **or `readme.txt`**. All file names will be retained.

#### Replace only a specific file type

If you want to select just `.wav` files
```shell
$ node game-sound-replacer.js -i input/**/*.wav -o output/**/*.wav
```

`**` matches zero or more directories (scan all subdirectories)

### Arguments

 Argument | Description
--- | ---
`-i <glob pattern>` | Specify input files
`-o <glob pattern>` | Specify output files
`-s <seed>` | Specify seed for random file selection

[Glob pattern help](https://www.npmjs.com/package/glob#glob-primer)