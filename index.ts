import readline from 'readline';
import Gtts from 'gtts';
import playSound from 'play-sound';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import dotenv from 'dotenv';
dotenv.config();

const { LANGUAGE, SPEED } = process.env;
console.log(`Current configuration : Language : ${LANGUAGE} | Speed : ${SPEED}`)
const filePath = './output.mp3';
const outputFilename = './acelerated.mp3';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function speakMessage() {
  rl.question('>>> ', async (message) => {
    const speech = new Gtts(message, LANGUAGE);
    const MessageToSpeak = await speech.stream()
    speech.save(filePath, (err: any) => {
      if (err) {
        console.error('Error on speak:', err);
      } else {
        console.log('Message created successful !');
        const writeStream = fs.createWriteStream(filePath);
        MessageToSpeak.pipe(writeStream);
        writeStream.on('finish', () => {
          ffmpeg()
            .input(filePath)
            .audioFilters(`atempo=${SPEED}`)
            .output(outputFilename)
            .outputOptions('-y')
            .on('end', async () => {
              console.log('finished !');
              fs.createReadStream(outputFilename);
              const player = playSound({ players: ['mplayer'] });
              player.play(outputFilename, (err: any) => {
                if (err) console.error('Error on play:', err);
                speakMessage();
              });
            })
            .on('error', (err: any) => {
              console.error(err);
            })
            .run();
        });
      }
    });
  });
}
speakMessage();

