// Audio stays in this Worker. Only engine/model assets are downloaded.
self.onmessage=async({data})=>{try{
const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js');
env.allowLocalModels=false;env.useBrowserCache=true;env.backends.onnx.wasm.numThreads=1;
const allowed=['tiny','base','small'];if(!allowed.includes(data.model))throw new Error('Unknown model');
const send=(message,percent)=>self.postMessage({type:'progress',message,percent});
const transcriber=await pipeline('automatic-speech-recognition',`Xenova/whisper-${data.model}`,{device:'wasm',dtype:'q8',progress_callback:p=>{if(p.status==='progress')send(`モデルをダウンロード中 · ${p.file}`,p.progress);else if(p.status==='initiate')send('認識モデルを確認しています');}});
send('文字起こし中 · 長い音声は時間がかかります');
const options={task:'transcribe',return_timestamps:true,chunk_length_s:30,stride_length_s:5};if(data.language!=='auto')options.language=data.language;
const result=await transcriber(data.audio,options);self.postMessage({type:'done',result});await transcriber.dispose();
}catch(error){self.postMessage({type:'error',message:'文字起こしに失敗しました。通信を確認し、軽いモデルや短い音声で再試行してください。詳細: '+String(error.message).slice(0,350)});}};
