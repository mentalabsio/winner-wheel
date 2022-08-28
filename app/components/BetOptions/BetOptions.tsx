import { getGradient } from '@/styles/theme'
import { Dispatch, SetStateAction } from 'react'
import { Button, Flex } from 'theme-ui'

const betOptions = [0.05, 0.1, 0.25, 0.5, 1]

export interface BetOptionsProps {
  selectedBet: number
  setSelectedBet: Dispatch<SetStateAction<number>>
}

export const BetOptions = ({
  selectedBet,
  setSelectedBet,
}: BetOptionsProps) => {
  return (
    <Flex
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        maxWidth: '36rem',
      }}
    >
      {betOptions.map((value) => (
        <Button
          onClick={() => setSelectedBet(value)}
          sx={{
            marginRight: '2rem',
            marginBottom: '1rem',
            color: '#000',
            background: (theme) => theme.colors?.primary,
            border: (theme) =>
              selectedBet === value
                ? `1px solid #fff`
                : '1px solid transparent',
          }}
        >
          {value} SOL
        </Button>
      ))}
    </Flex>
  )
}
