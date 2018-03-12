import App from './components/app';
import { render } from './utils/component';

const container = document.getElementById('app');
const app = new App();

render(container!, app);
