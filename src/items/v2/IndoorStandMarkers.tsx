import { SymbolLayout, SymbolPaint } from 'mapbox-gl';
import React, { RefObject, useEffect, useState } from 'react';
import { Layer, LayerProps, MapRef, Source } from 'react-map-gl';
import { useLoadMapImages } from '../../hooks/map/useLoadMapImages';
import { IIndoorStandWorldMarker } from '../../utils/world/worldTypes';
import { EmptyLayer } from './EmptyLayer';
import { automoveMarkers } from './automoveMarkers';

const zoomStepMiddle = 19;
const zoomStepMax = 20;

export function getSourceFeaturesForIndoorStands(
    markers: IIndoorStandWorldMarker[],
    highlightedMarkerIds?: string[]
) {
    return (
        markers
            .filter((e) => e.visible)
            .map((marker, i) => {
                const data = marker.elementData;
                const isHighlighted = highlightedMarkerIds?.includes(marker.id);

                return {
                    type: 'Feature' as const,
                    properties: {
                        markerId: marker.id,
                        clickable: marker.selectable ? '1' : '0',
                        text: data.text,
                        textColor: data.textColor,
                        pinSrc: data.pinSrc,
                        imageSrc: data.imageSrc ?? data.pinSrc,
                        textHaloBlur: isHighlighted ? 2 : 1,
                        textHaloColor: isHighlighted ? '#F8E71C' : data.textHaloColor,
                        textHaloWidth: isHighlighted ? 1 : data.textHaloWidth
                    },
                    geometry: {
                        type: 'Point' as const,
                        coordinates: [marker.lng, marker.lat, i]
                    }
                };
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((e): e is GeoJSON.Feature<GeoJSON.Point, any> => Boolean(e))
    );
}

export const IndoorStandMarkers = (props: {
    mapRef: RefObject<MapRef>;
    markers: IIndoorStandWorldMarker[];
    beforeId?: string;
    highlightedMarkerIds?: string[];
}) => {
    const [areImagesLoaded, setAreImagesLoaded] = useState(false);

    const mapRef = props.mapRef.current;
    const pinUrls = props.markers.map((marker) => marker.elementData.pinSrc);
    const imageUrls = props.markers.map((marker) => marker.elementData.imageSrc);

    const layerIds = {
        layer: 'indoor_stands|layer',
        layerClickable: 'indoor_stands|clickable',
        last: 'indoor_stands|last'
    };

    const beforeIds = {
        layer: props.beforeId,
        layerClickable: layerIds.layer,
        last: layerIds.layerClickable
    };

    useEffect(() => {
        if (mapRef && areImagesLoaded) {
            const mapRef = props.mapRef.current;
            automoveMarkers({ layerIds, beforeIds, mapRef });
        }
    }, [props.beforeId, props.mapRef?.current]);

    useLoadMapImages({
        mapRef: props.mapRef,
        imageUrls: [...pinUrls, ...imageUrls],
        hash: props.markers.length,
        onLoad: () => {
            if (props.markers?.length) {
                setAreImagesLoaded(true);
            }
        }
    });

    const sourceFeatures = getSourceFeaturesForIndoorStands(
        props.markers,
        props.highlightedMarkerIds
    );

    const layout: SymbolLayout = {
        'text-allow-overlap': false,
        'text-optional': true,
        'icon-optional': false,
        'icon-allow-overlap': true,
        'text-padding': 2,
        'text-offset': [0, 0.3],
        'icon-anchor': 'bottom',
        'text-anchor': 'top',
        'icon-image': [
            'step',
            ['zoom'],
            ['get', 'pinSrc'],
            zoomStepMiddle,
            ['get', 'pinSrc'],
            zoomStepMax,
            ['get', 'imageSrc']
        ],
        // 'text-field': ['step', ['zoom'], '', zoomStepMiddle, ['get', 'text']],
        'text-field': ['get', 'text'],
        'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            12,
            zoomStepMiddle - 1,
            12,
            zoomStepMiddle,
            12,
            zoomStepMax,
            12,
            24,
            24
        ],
        'icon-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            0.1,
            zoomStepMiddle - 1,
            0.1,
            zoomStepMiddle,
            0.15,
            zoomStepMax,
            0.15,
            24,
            1
        ]
    };

    const paint: SymbolPaint = {
        'text-color': ['get', 'textColor'],
        'text-halo-color': ['get', 'textHaloColor'],
        'text-halo-width': ['get', 'textHaloWidth'],
        'text-halo-blur': ['get', 'textHaloBlur']
    };

    const layer: LayerProps = {
        id: layerIds.layer,
        type: 'symbol' as const,
        source: 'icons',
        filter: ['==', ['get', 'clickable'], '0'],
        layout,
        paint
    };

    const clickableLayer: LayerProps = {
        id: layerIds.layerClickable,
        type: 'symbol' as const,
        source: 'icons',
        filter: ['==', ['get', 'clickable'], '1'],
        layout,
        paint
    };

    if (!areImagesLoaded) {
        return (
            <>
                <EmptyLayer id={layerIds.layer} beforeId={beforeIds.layer} />
                <EmptyLayer id={layerIds.layerClickable} beforeId={beforeIds.layerClickable} />
                <EmptyLayer id={layerIds.last} beforeId={beforeIds.last} />
            </>
        );
    }

    return (
        <>
            <Source
                id="indoor_stands"
                type="geojson"
                data={{
                    type: 'FeatureCollection' as const,
                    features: sourceFeatures
                }}
            >
                <Layer {...layer} />
                <Layer {...clickableLayer} />
                <EmptyLayer id={layerIds.last} beforeId={beforeIds.last} />
            </Source>
        </>
    );
};
