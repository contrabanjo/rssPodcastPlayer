const audio = document.getElementById("currentAudio");
const seek = document.getElementById("seek");
const play = document.getElementById("play");
const rew = document.getElementById("rewind");
const ff = document.getElementById("fast-forward");
const currentTime = document.getElementById("current");
const duration = document.getElementById("duration");


audio.addEventListener("loadedmetadata", (e) => {
  const date = new Date(0, 0, 0, 0, 0, audio.duration);
  const timeStr = date.toTimeString().split(' ')[0];
  duration.innerHTML = timeStr;
})

function seekTo(){
 console.log(audio.currentTime);
 console.log(seek.value);
 audio.currentTime = audio.duration * (seek.value/100)
}

function updateCurrentTime(){
  seek.value = Math.round((audio.currentTime/audio.duration) * 100);
  const date = new Date(0, 0, 0, 0, 0, audio.currentTime);
  const timeStr = date.toTimeString().split(' ')[0];
  currentTime.innerHTML = timeStr
}

seek.addEventListener('change', seekTo);
audio.addEventListener('timeupdate', updateCurrentTime);


play.addEventListener('click', ()=>{audio.paused ? audio.play() : audio.pause(); audio.paused ? document.getElementById("play-button").className = "play": document.getElementById("play-button").className = "pause";});
play.addEventListener('mousedown', ()=>{document.getElementById("play-button").className = "stop"})
play.addEventListener('mouseup', ()=>{document.getElementById("play-button").className = "play"})


rew.addEventListener('click', ()=>{audio.currentTime-=10})
ff.addEventListener('click', ()=>{audio.currentTime+=10})
