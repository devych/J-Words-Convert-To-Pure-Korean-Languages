import descriptions from '../data/word.json';

class WordStock {
  static getDescription(word) {
    return descriptions[word];
  }
}

export default WordStock;