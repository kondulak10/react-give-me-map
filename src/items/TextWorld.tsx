import React from 'react';
import styled, { css } from 'styled-components';
import { EWorldColor } from '../libs/worldVariables';
import { TEXT_BORDER_RADIUS } from '../utils/world/worldConfig';
import { ITextWorld } from '../utils/world/worldTypes';

export interface ITextWorldProps {
    elementData: ITextWorld;
}

export const TextWorld = (props: ITextWorldProps): JSX.Element => {
    return (
        <S_TextWorld
            fill={props.elementData.fill.toString()}
            width={300 + props.elementData.width * 100}
            color={props.elementData.color}
            textColor={props.elementData.textColor}
            textShadow={props.elementData.textShadow}
            borderRadiusPx={props.elementData.borderRadiusPx}
            borderSize={props.elementData.borderSize}
            borderColor={props.elementData.borderColor}
            dropShadowCombined={props.elementData.dropShadowCombined}
        >
            <pre>{props.elementData?.text + ' '}</pre>
        </S_TextWorld>
    );
};

const S_TextWorld = styled.div<{
    width: number;
    borderRadiusPx?: number;
    borderSize?: number;
    borderColor?: string;
    textColor?: string;
    textShadow?: string;
    dropShadowCombined?: string;
    fill: string;
    color: string;
}>`
    width: ${(props) => (props.width > 0 ? props.width : 0)}px;
    min-width: 150px;
    display: flex;
    position: relative;

    ${(props) => {
        return css`
            border-radius: ${props.borderRadiusPx ?? TEXT_BORDER_RADIUS}px;
            border-width: ${props.borderSize}px;
            border-style: solid;
            border-color: #${props.borderColor};
            box-shadow: ${props.dropShadowCombined};
        `;
    }}
    ${(props) => {
        if (props.fill === 'true') {
            return css`
                background-color: ${(props: { color: string }) => '#' + props.color};
                padding: 20px;
                > pre {
                    color: #${props.textColor ?? EWorldColor.WHITE};
                    text-shadow: ${props.textShadow ?? '1px 1px 2px rgba(0, 0, 0, 0.5)'};
                }
            `;
        } else {
            return css`
                padding: 5px;
                > pre {
                    color: #${props.textColor ?? props.color};
                    text-shadow: ${props.textShadow ?? '1px 1px 2px rgba(0, 0, 0, 0.25)'};
                }
            `;
        }
    }}
    > pre {
        font-size: 14px;
        background-color: unset;
        width: 100%;
        padding: 0;
        margin: 0;
        line-height: 22px;
        white-space: break-spaces;
    }
`;
