export class GaloisField {
  public readonly m: number;
  public readonly size: number;
  public readonly primitivePoly: number;
  public readonly expTable: number[];
  public readonly logTable: number[];

  constructor(m: number = 8, primitivePoly: number = 0x11d) {
    this.m = m;
    this.size = 1 << m; // 2^m
    this.primitivePoly = primitivePoly;

    this.expTable = new Array(this.size * 2).fill(0);
    this.logTable = new Array(this.size).fill(0);

    this.initTables();
  }

  private initTables(): void {
    let x = 1;
    for (let i = 0; i < this.size - 1; i++) {
      this.expTable[i] = x;
      this.logTable[x] = i;
      x <<= 1;
      if (x & this.size) {
        x ^= this.primitivePoly;
      }
    }
    // Wykonujemy powielenie tablicy wykładniczej dla uniknięcia modulo w mnożeniu
    for (let i = this.size - 1; i < this.size * 2 - 1; i++) {
      this.expTable[i] = this.expTable[i - (this.size - 1)];
    }
  }

  /** Dodawanie i odejmowanie w GF(2^m) to operacja XOR */
  public add(a: number, b: number): number {
    return a ^ b;
  }

  public subtract(a: number, b: number): number {
    return a ^ b;
  }

  /** Mnożenie elementów ciała Galois z wykorzystaniem tablic LOG/EXP */
  public multiply(a: number, b: number): number {
    if (a === 0 || b === 0) return 0;
    return this.expTable[this.logTable[a] + this.logTable[b]];
  }

  /** Dzielenie a / b */
  public divide(a: number, b: number): number {
    if (b === 0) throw new Error("Dzielenie przez zero w ciele Galois!");
    if (a === 0) return 0;
    const logDiff = this.logTable[a] - this.logTable[b] + (this.size - 1);
    return this.expTable[logDiff % (this.size - 1)];
  }

  /** Potęgowanie elementu x^power */
  public power(x: number, p: number): number {
    if (x === 0) return 0;
    if (p === 0) return 1;
    const log = (this.logTable[x] * p) % (this.size - 1);
    return this.expTable[log < 0 ? log + (this.size - 1) : log];
  }

  /** Odwrotność elementu 1/x */
  public inverse(x: number): number {
    if (x === 0) throw new Error("Brak odwrotności dla zera!");
    return this.expTable[(this.size - 1) - this.logTable[x]];
  }
}