import Configuration from './utils/Configuration';
import { StationTemplateURL } from './types/ConfigurationData';
import Wrk from './charging-station/Worker';

class Bootstrap {
  static start() {
    try {
      let numStationsTotal = 0;
      let numConcurrentWorkers = 0;
      // Start each ChargingStation object in a worker thread
      if (Configuration.getStationTemplateURLs()) {
        Configuration.getStationTemplateURLs().forEach((stationURL: StationTemplateURL) => {
          try {
            const nbStations = stationURL.numberOfStations ? stationURL.numberOfStations : 0;
            numStationsTotal += nbStations;
            for (let index = 1; index <= nbStations; index++) {
              const worker = new Wrk('./dist/charging-station/StationWorker.js', {
                index,
                templateFile: stationURL.file,
              }, numStationsTotal);
              worker.start().catch(() => {});
              numConcurrentWorkers = worker.concurrentWorkers;
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.log('Charging station start with template file ' + stationURL.file + ' error ' + JSON.stringify(error, null, ' '));
          }
        });
      } else {
        console.log('No stationTemplateURLs defined in configuration, exiting');
      }
      if (numStationsTotal === 0) {
        console.log('No charging station template enabled in configuration, exiting');
      } else {
        console.log('Charging station simulator started with ' + numStationsTotal.toString() + ' charging station(s) of ' + numConcurrentWorkers.toString() + ' concurrently running');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Bootstrap start error ' + JSON.stringify(error, null, ' '));
    }
  }
}

Bootstrap.start();
