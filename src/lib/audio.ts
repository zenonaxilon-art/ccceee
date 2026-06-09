import { Howl, Howler } from 'howler';

const BGM_TRACKS = {
  void: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_2bc0d5d796.mp3', // Sci-fi ambient placeholder
};

const SFX = {
  click: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3', // pop or click
  crit: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_8dd9b8676d.mp3', // crisp hit
  purchase: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_73138b72e5.mp3', // coin/cash register
  upgrade: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_c363dc0b4d.mp3', // powerup
  hatch: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_c0cdd7ffb9.mp3', // magic reveal
  prestige: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_03d29cb190.mp3', // epic sweep
};

const sfxPool: Record<string, Howl> = {};
let currentBgm: Howl | null = null;

export const initAudio = () => {
  Object.keys(SFX).forEach(key => {
    sfxPool[key] = new Howl({
      src: [SFX[key as keyof typeof SFX]],
      volume: 0.5,
    });
  });
};

export const playSfx = (name: keyof typeof SFX, volume = 1.0) => {
  if (sfxPool[name]) {
    const id = sfxPool[name].play();
    sfxPool[name].volume(volume, id);
  }
};

export const playBgm = (name: keyof typeof BGM_TRACKS) => {
  if (currentBgm) {
    currentBgm.stop();
  }
  
  if (BGM_TRACKS[name]) {
    currentBgm = new Howl({
      src: [BGM_TRACKS[name]],
      loop: true,
      volume: 0.3,
    });
    currentBgm.play();
  }
};

export const setMasterVolume = (vol: number) => {
  Howler.volume(vol);
};
