import { isNil, omitBy } from 'lodash';
import { LinePaint } from 'mapbox-gl';
import React, { RefObject, useEffect } from 'react';
import { Layer, MapRef, Source } from 'react-map-gl';
import { coordsToArrays } from '../../utils/geojson/coordsToArrays';
import { IRouteV2WorldMarker } from '../../utils/world/worldTypes';
import { EmptyLayer } from './EmptyLayer';
import { automoveMarkers } from './automoveMarkers';
interface Props {
    mapRef: RefObject<MapRef>;
    marker: IRouteV2WorldMarker;
    beforeId?: string;
    onClick?: (e: MouseEvent) => void;
    orderIndex: number;
}

export const RouteV2Marker = (props: Props): JSX.Element => {
    const mapRef = props.mapRef;
    const data = props.marker.elementData;
    const markerId = props.marker.id;

    const sourceId = markerId;

    const layerIds = {
        layer: `${markerId}|layer`,
        layerClick: `${markerId}|clickable`,
        last: `${markerId}|last`
    };

    const beforeIds = {
        layer: props.beforeId,
        layerClick: layerIds.layer,
        last: layerIds.layerClick
    };

    const width = data.width ?? 5;

    useEffect(() => {
        if (!props.mapRef.current) {
            return;
        }

        automoveMarkers({
            mapRef: mapRef.current,
            layerIds,
            beforeIds
        });
    }, [props.beforeId, props.mapRef?.current]);

    if (data.coordinates.length < 2) {
        return <></>;
    }

    const paintAttributes: LinePaint = {
        'line-color': data.color,
        'line-width': width,
        'line-opacity': data.opacity ?? 1,
        'line-dasharray':
            data.dashed?.isDashed && data.dashed?.lineLength && data.dashed?.gapLength
                ? [data.dashed.lineLength, data.dashed.gapLength]
                : undefined
    };

    return (
        <>
            <Source
                key={sourceId}
                id={sourceId}
                type="geojson"
                data={{
                    type: 'Feature',
                    properties: {
                        orderIndex: props.orderIndex
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: coordsToArrays(props.marker.elementData.coordinates)
                    }
                }}
            >
                <Layer
                    id={layerIds.layer}
                    beforeId={beforeIds.layer}
                    source={sourceId}
                    type="line"
                    paint={{ ...omitBy(paintAttributes, isNil) }}
                    layout={{
                        'line-cap': 'round',
                        'line-join': 'round',
                        visibility: props.marker.visible ? 'visible' : 'none'
                    }}
                />
                <Layer
                    id={layerIds.layerClick}
                    beforeId={beforeIds.layerClick}
                    source={sourceId}
                    type="line"
                    metadata={{
                        try: 'this'
                    }}
                    paint={{
                        'line-color': 'black',
                        'line-width': Math.max(width, 30),
                        'line-opacity': 0
                    }}
                    layout={{
                        visibility: props.marker.visible ? 'visible' : 'none'
                    }}
                />
                <EmptyLayer id={layerIds.last} beforeId={beforeIds.last} />
            </Source>
        </>
    );
};
