import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
} from 'recoil';

import { Editor } from '@/components/Editor';

function App() {

  return (
    <div className="App" >
    
        <section>
          <Editor />
        </section>
  
    </div>
  );
}
export default App;