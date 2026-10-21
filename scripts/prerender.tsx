import {StrictMode} from "react";
import {renderToPipeableStream} from "react-dom/server";
import {Writable} from "node:stream";
import App from "../src/App";

// Await the existing lazy routes, then emit the same React tree for hydration.
// No browser, WebGL, network requests or user-agent-specific content is needed.
export function renderPage(route:string):Promise<string>{
  return new Promise((resolve,reject)=>{
    let html="";
    const sink=new Writable({write(chunk,_encoding,done){html+=chunk.toString();done();}});
    const timer=setTimeout(()=>{stream.abort();reject(new Error("Prerender timed out: "+route));},15000);
    sink.on("finish",()=>{clearTimeout(timer);resolve(html);});
    sink.on("error",error=>{clearTimeout(timer);reject(error);});
    const stream=renderToPipeableStream(<StrictMode><App initialRoute={route}/></StrictMode>,{
      onAllReady(){stream.pipe(sink);},
      onShellError(error){clearTimeout(timer);reject(error);},
      onError(error){clearTimeout(timer);reject(error);}
    });
  });
}
