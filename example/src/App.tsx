import { Text, View, StyleSheet, TextInput, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import {
  Calculator,
  type BinaryOperator,
  SafeAddition,
  ComputationResult,
} from 'react-native-sia';

// A Rust object
const calculator = new Calculator();
// A Rust object implementing the Rust trait BinaryOperator
const addOp = new SafeAddition();

// A Typescript class, implementing BinaryOperator
class SafeMultiply implements BinaryOperator {
  perform(lhs: bigint, rhs: bigint): bigint {
    return lhs * rhs;
  }
}
const multOp = new SafeMultiply();

export default function App() {
  const [lhs, setLhs] = useState<string>('');
  const [rhs, setRhs] = useState<string>('');
  const [op, setOp] = useState<'add' | 'mult'>('add');
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    try {
      const lhsStr = lhs.trim() === '' ? '0' : lhs.trim();
      const rhsStr = rhs.trim() === '' ? '0' : rhs.trim();
      const lhsBig = BigInt(lhsStr);
      const rhsBig = BigInt(rhsStr);
      const operator = op === 'add' ? addOp : multOp;
      const computation: ComputationResult | undefined = calculator
        .calculate(operator, lhsBig, rhsBig)
        .lastResult();
      const value = computation?.value;
      setResult(value !== undefined ? value.toString() : '');
    } catch (e) {
      setResult('');
    }
  }, [lhs, rhs, op]);

  return (
    <View style={styles.container}>
      <View style={styles.inputsRow}>
        <TextInput
          style={[styles.input, styles.inputFlex]}
          value={lhs}
          onChangeText={setLhs}
          placeholder="First"
          keyboardType="number-pad"
        />
        <View style={styles.spacer} />
        <TextInput
          style={[styles.input, styles.inputFlex]}
          value={rhs}
          onChangeText={setRhs}
          placeholder="Second"
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.toggleRow}>
        <Pressable
          onPress={() => setOp('add')}
          style={[
            styles.toggleOption,
            op === 'add' && styles.toggleOptionActive,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Addition"
        >
          <Text
            style={[styles.toggleText, op === 'add' && styles.toggleTextActive]}
          >
            ＋
          </Text>
        </Pressable>
        <View style={styles.spacer} />
        <Pressable
          onPress={() => setOp('mult')}
          style={[
            styles.toggleOption,
            op === 'mult' && styles.toggleOptionActive,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Multiplication"
        >
          <Text
            style={[
              styles.toggleText,
              op === 'mult' && styles.toggleTextActive,
            ]}
          >
            ×
          </Text>
        </Pressable>
      </View>
      <Text>Result: {result || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputsRow: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 0,
    height: 44,
  },
  inputFlex: {
    flex: 1,
  },
  toggleRow: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  spacer: {
    width: 12,
  },
  toggleOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  toggleOptionActive: {
    borderColor: '#111827',
    backgroundColor: '#f3f4f6',
  },
  toggleText: {
    fontSize: 18,
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
});
